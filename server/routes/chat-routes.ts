import type { ChatCompletionMessageParam } from "openai/resources/chat/index.js";
import express from "express";
import debug from "debug";
import {
  BaseError,
  chatGPTFunctionsPrompt,
  ToolError,
} from "../utils/index.js";
import { tools } from "../tools/index.js";

import { ChatMessage } from "../models/index.js";
import { promptSystemDefault } from "../ai/prompts.js";
import { getSocketIO } from "../socket.io-server.js";
import { getComputedSettings, settings } from "../settings.js";
import {
  projectFileToSearchResultString,
  searchProjectFiles,
} from "../ai/vector-store.js";
import { getLLM } from "../ai/llms/index.js";

const log = debug("gpp:server:routes:chat");

const dbChatMessageToAPIMessage = (
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
  const messages = await ChatMessage.findAll({
    where: { project: settings.projectName },
  });

  res.send(messages);
});

chatRoutes.post("/chat", async (req, res) => {
  log("/chat", req.body);
  const userMessage = ChatMessage.build({
    role: "user",
    content: req.body.message,
    project: settings.projectName,
  });
  log(userMessage.toJSON());

  // create user message
  await userMessage.save();

  // Find files similar to the message
  // Split the message up and look for files which are similar
  const similarFiles = await searchProjectFiles({
    query: userMessage.content,
    limit: 3,
  });

  const similarFilesPrompt =
    "The codebase says:\n\n" +
    similarFiles.map(projectFileToSearchResultString).join("\n\n");

  log("similarFilesPrompt", similarFilesPrompt);

  const callModel = async () => {
    const { model } = getComputedSettings();
    const llm = getLLM(model.name);

    const systemMessage = await promptSystemDefault();

    const RESPONSE_TOKEN_BUDGET = Math.floor(model.contextSize * 0.4);
    const CONTEXT_TOKEN_BUDGET = model.contextSize - RESPONSE_TOKEN_BUDGET;
    const FUNCTIONS_TOKENS = await llm.countTokens(chatGPTFunctionsPrompt);
    const SIMILAR_FILES_TOKENS = await llm.countTokens(similarFilesPrompt);
    const SYSTEM_MESSAGE_TOKENS = await llm.countTokens(systemMessage);

    let MESSAGE_TOKENS_BUDGET =
      CONTEXT_TOKEN_BUDGET -
      FUNCTIONS_TOKENS -
      SYSTEM_MESSAGE_TOKENS -
      SIMILAR_FILES_TOKENS;

    // get enough messages to fill the context budget
    const dbMessages = await ChatMessage.findAll({
      where: { project: settings.projectName },
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

      const messageTokens = await llm.countTokens(message.content);

      if (messageTokens > MESSAGE_TOKENS_BUDGET) {
        const TOKEN_BUFFER = 100;
        const LENGTH_BUFFER = TOKEN_BUFFER * 4; // ~1 token = 4 chars
        const percentTokensAvailable = messageTokens / MESSAGE_TOKENS_BUDGET;
        const maxContentLength =
          message.content.length * percentTokensAvailable - LENGTH_BUFFER;

        // keep as much of the tail of the last message that will fit in context
        message.content = message.content.slice(maxContentLength);
        messagesTokens += await llm.countTokens(message.content);
        MESSAGE_TOKENS_BUDGET = 0;
        break;
      }

      MESSAGE_TOKENS_BUDGET -= messageTokens;
      messagesTokens += messageTokens;
      // TODO: this transform is only valid for OpenAI. Move this to the LLM.
      contextMessages.unshift(dbChatMessageToAPIMessage(message));
    }

    const totalContextTokens =
      messagesTokens +
      FUNCTIONS_TOKENS +
      SYSTEM_MESSAGE_TOKENS +
      SIMILAR_FILES_TOKENS;

    log("/chat tokens", {
      budgetTotal: llm.contextSize,
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
      project: settings.projectName,
    });

    const write = (chunk: string) => {
      replyMessage.update({ content: replyMessage.content + chunk });
      io.emit("chatMessageStream", { id: replyMessage.id, chunk: chunk });
    };

    await llm.chat(
      { messages: contextMessages, maxTokens: RESPONSE_TOKEN_BUDGET },
      async (error, data) => {
        if (error) {
          write(`\n\n${error.toString()}`);
          return;
        }
        const { content, done, functionCall } = data;

        write(content);

        if (functionCall) {
          const { name: func, arguments: args } = functionCall;

          replyMessage.functionCall = replyMessage.functionCall || {
            name: func,
            arguments: args,
          };
          await replyMessage.save();

          // parse args
          let argsJSon = {};
          try {
            argsJSon = JSON.parse(args);
          } catch (error) {
            log("JSON.parse(args) Fail", error);
            write(`\n\nFailed to JSON.parse function args: "${error}"`);
            // TODO: break? retry? The function will not get the correct args.
          }

          try {
            await callFunction(func, argsJSon);
          } catch (err) {
            if (err instanceof ToolError) {
              res.send(`\n\nToolError: "${err}"`);
            } else {
              res.send(`\n\nError: "${err}"`);
            }
          }

          // let model reply to function
          return await callModel();
        }

        if (done) {
          log(
            "/chat replyMessage done",
            contextMessages.map((m) => {
              return `${m.role}: ${m.content.slice(0, 20)}...`;
            }),
          );
          await replyMessage.save();
          io.emit("chatMessageStreamEnd");

          if (!functionCall) res.end();
        }
      },
    );

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

  const callFunction = (func: string, args: object) => {
    const tool = tools[func];

    const argsString = JSON.stringify(args, null, 2);
    log(`/chat callFunction ${func}(${argsString})`);

    if (!tool) {
      throw new BaseError(`Tool "${func}" not found.`);
    }

    // TODO: before doing this action, what memories or thoughts are triggered from considering?
    //       const remembered = mind.memory.query(<context>)
    //       have a thinking process to evaluate this decision and adjust if needed
    return tool(args);
  };

  try {
    await callModel();
  } catch (error) {
    log("callModel error", error);
    res.status(500).send(`\n\n500 Error: ${error.toString()}`);
    res.end();
  }
});
