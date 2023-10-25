import type { ChatCompletionMessageParam } from "openai/resources/chat/index.js";
import express from "express";
import debug from "debug";
import {
  chatGPTFunctionsPrompt,
  countTokens,
  openAIFunctions,
  ToolError,
  trimStringToTokens,
} from "../utils/index.js";
import { tools } from "../tools/index.js";

import { ChatMessage, ProjectFile } from "../models/index.js";
import { openai } from "../ai/utils.js";
import { promptSystemDefault } from "../ai/prompts.js";
import { getSocketIO } from "../socket.io-server.js";
import { getComputedSettings } from "../settings.js";
import { getDB } from "../database/index.js";
import { splitWords } from "../ai/text-splitters.js";
import { embeddings } from "../ai/embeddings.js";

const log = debug("gpp:server:routes:chat");

const ChatMessageToOpenAIMessage = (
  chatMessage: ChatMessage,
): ChatCompletionMessageParam => {
  const { role, content, name, functionCall } = chatMessage;

  const result: ChatCompletionMessageParam = { role, content };

  if (name) result.name = name;
  if (functionCall) result.function_call = functionCall;

  return result;
};

export const chatRoutes = express.Router();

chatRoutes.post("/chat/new", async (req, res) => {
  await ChatMessage.sync({ force: true });

  res.json(await ChatMessage.findAll());
});

chatRoutes.get("/chat/messages", async (req, res) => {
  const messages = await ChatMessage.findAll();

  res.send(messages);
});

chatRoutes.post("/chat", async (req, res) => {
  log("/chat", req.body);
  const userMessage = ChatMessage.build({
    role: "user",
    content: req.body.message,
  });
  log(userMessage.toJSON());

  // create user message
  await userMessage.save();

  // Find files similar to the message
  // Split the message up and look for files which are similar
  const db = await getDB();
  const chunks = splitWords(userMessage.content, embeddings.sequenceLength);

  let similarFiles: ProjectFile[] = [];
  for (const chunk of chunks) {
    const chunkEmbedding = await embeddings.encode(chunk);
    similarFiles = await ProjectFile.findAll({
      order: [db.literal(`embedding <-> '[${chunkEmbedding}]'`)],
      limit: 5,
    });
  }

  const similarFilesPrompt =
    "The codebase says:\n\n" +
    similarFiles
      .map((f) => {
        const { path, content } = f.toJSON();
        return `${path}:\n"""\n${content}\n"""\n`;
      })
      .join("\n");

  log("similarFilesPrompt", similarFilesPrompt);

  const callModel = async () => {
    const { model } = getComputedSettings();

    const systemMessage = await promptSystemDefault();

    const RESPONSE_TOKEN_BUDGET = Math.floor(model.contextSize * 0.4);
    const CONTEXT_TOKEN_BUDGET = model.contextSize - RESPONSE_TOKEN_BUDGET;
    const FUNCTIONS_TOKENS = countTokens(model.name, chatGPTFunctionsPrompt);
    const SIMILAR_FILES_TOKENS = countTokens(model.name, similarFilesPrompt);
    const SYSTEM_MESSAGE_TOKENS = countTokens(model.name, systemMessage);

    const LARGEST_SINGLE_MESSAGE_TOKENS = 0.25 * CONTEXT_TOKEN_BUDGET;

    let MESSAGE_TOKENS_BUDGET =
      CONTEXT_TOKEN_BUDGET -
      FUNCTIONS_TOKENS -
      SYSTEM_MESSAGE_TOKENS -
      SIMILAR_FILES_TOKENS;

    // get enough messages to fill the context budget
    const dbMessages = await ChatMessage.findAll({
      order: [["createdAt", "ASC"]],
      limit: 10,
    });
    log(`/chat ${dbMessages.length} dbMessages`);

    // Build the context of messages starting from the most recent message
    // and going backwards. Once we reach the end of the context token budget,
    // trim the last message to fit.
    const contextMessages: ChatCompletionMessageParam[] = [];
    let messagesTokens = 0;
    while (dbMessages.length > 0 && MESSAGE_TOKENS_BUDGET > 0) {
      const message = dbMessages.pop();

      const messageTokens = countTokens(model.name, message.content);

      // No single message should be allowed to dominate the entire context.
      if (messageTokens > LARGEST_SINGLE_MESSAGE_TOKENS) {
        trimStringToTokens(
          model.name,
          LARGEST_SINGLE_MESSAGE_TOKENS,
          message.content,
        );
      }

      if (messageTokens > MESSAGE_TOKENS_BUDGET) {
        const TOKEN_BUFFER = 100;
        const LENGTH_BUFFER = TOKEN_BUFFER * 4; // ~1 token = 4 chars
        const percentTokensAvailable = messageTokens / MESSAGE_TOKENS_BUDGET;
        const maxContentLength =
          message.content.length * percentTokensAvailable - LENGTH_BUFFER;

        // keep as much of the tail of the last message that will fit in context
        message.content = message.content.slice(maxContentLength);
        messagesTokens += countTokens(model.name, message.content);
        MESSAGE_TOKENS_BUDGET = 0;
        break;
      }

      MESSAGE_TOKENS_BUDGET -= messageTokens;
      messagesTokens += messageTokens;
      contextMessages.unshift(ChatMessageToOpenAIMessage(message));
    }

    const totalContextTokens =
      messagesTokens +
      FUNCTIONS_TOKENS +
      SYSTEM_MESSAGE_TOKENS +
      SIMILAR_FILES_TOKENS;

    log("/chat tokens", {
      budgetTotal: model.contextSize,
      budgetContext: CONTEXT_TOKEN_BUDGET,
      budgetResponse: RESPONSE_TOKEN_BUDGET,
      contextFunctions: FUNCTIONS_TOKENS,
      contextSystem: SYSTEM_MESSAGE_TOKENS,
      contextMessages: messagesTokens,
      contextTotal: totalContextTokens,
    });

    // insert system message at the start of every context stack
    contextMessages.unshift({ role: "system", content: systemMessage });

    // TODO: only push context messages if needed. Let LLM decide what context it needs.
    const lastMessage = contextMessages.pop();
    contextMessages.push({
      role: "function",
      name: "memoriesFromAssistant",
      content: similarFilesPrompt,
    });
    contextMessages.push(lastMessage);

    log(
      `/chat ${contextMessages.length} messages ${messagesTokens} tokens`,
      contextMessages.map((m) => {
        return `${m.role}: ${m.content}`;
      }),
    );

    const io = getSocketIO();

    io.emit("contextWindowUpdate", {
      messages: contextMessages,
      tokens: totalContextTokens,
    });

    const replyMessage = await ChatMessage.create({
      role: "assistant",
      content: "",
    });

    const write = (message: string) => {
      replyMessage.content += message;
      io.emit("chatMessageStream", { id: replyMessage.id, chunk: message });
    };

    try {
      // Function call args stream in, build them up
      let func = "";
      let args = "";

      const stream = await openai.chat.completions.create({
        model: model.name,
        messages: contextMessages,
        stream: true,
        n: 1,
        max_tokens: RESPONSE_TOKEN_BUDGET,
        functions: openAIFunctions,
        function_call: "auto",
      });

      // Stream
      for await (const part of stream) {
        const { delta, finish_reason } = part.choices[0];
        if (delta?.function_call?.name) {
          func = delta?.function_call?.name;
          replyMessage.functionCall = replyMessage.functionCall || {
            name: func,
            arguments: "",
          };
        }

        if (delta?.function_call?.arguments) {
          args += delta?.function_call?.arguments;
          replyMessage.functionCall = replyMessage.functionCall || {
            name: "",
            arguments: replyMessage.functionCall.arguments + args,
          };
        }

        //
        // Stop
        //
        if (finish_reason === "stop") {
          log("finish_reason", finish_reason);
          break;
        }

        //
        // Content Length
        //
        else if (finish_reason === "length") {
          log("finish_reason", finish_reason);
          write("\n\n(...truncated due to max length)");
          break;
        }

        //
        // Call function
        //
        else if (finish_reason === "function_call") {
          log("finish_reason", finish_reason);

          const printArgs = args === "{}" ? "" : args;
          write(` \`\n${func}(${printArgs})\` `);

          // parse args
          let argsJSon = {};
          try {
            argsJSon = JSON.parse(args);
          } catch (error) {
            log("JSON.parse(args) Fail", error);
            write(`\n\nError parsing JSON: "${error}"\n\n`);
            // TODO: break? retry? The function will not get the correct args.
          }

          await replyMessage.save();

          // call function
          await callFunction(func, argsJSon);

          // let model reply to function
          return await callModel();
        }

        //
        // Content Filter
        //
        else if (finish_reason === "content_filter") {
          log("finish_reason", finish_reason);
          write(`\n\nContent Filter: "${delta.content}"\n\n`);
        }

        //
        // Send text
        //
        else if (finish_reason === null) {
          if (typeof delta.content === "string") {
            write(delta.content);
          }
        } else {
          write(`\n\nUnknown finish_reason "${finish_reason}"\n\n`);
          log("unknown finish_reason", finish_reason);
        }
      }
    } catch (error) {
      write(`\n\n500 Error: ${error.toString()}`);
      throw error;
    }

    log(
      "/chat end",
      contextMessages.map((m) => {
        return `${m.role}: ${m.content.slice(0, 20)}...`;
      }),
    );
    await replyMessage.save();
    io.emit("chatMessageStreamEnd");
    res.end();
  };

  const callFunction = async (func: string, args: object) => {
    const tool = tools[func];

    const argsString = JSON.stringify(args, null, 2);
    log(`/chat callFunction ${func}(${argsString})`);

    if (!tool) {
      res.write(`\n\nTool "${func}" not found.\n\n`);
    }

    // TODO: before doing this action, what memories or thoughts are triggered from considering?
    //       const remembered = mind.memory.query(<context>)
    //       have a thinking process to evaluate this decision and adjust if needed
    try {
      return await tool(args);
    } catch (err) {
      if (err instanceof ToolError) {
        res.write('\n\nToolError: "' + err + '"' + "\n\n");
      } else {
        res.write('\n\nError: "' + err + '"' + "\n\n");
      }
    }
  };

  try {
    await callModel();
  } catch (error) {
    log("callModel error", error);
    res.status(500).write(`\n\n500 Error: ${error.toString()}`);
    res.end();
  }
});
