import type { ChatCompletionMessageParam } from "openai/resources/chat/index.js";
import express from "express";
import debug from "debug";
import {
  chatGPTFunctionsPrompt,
  countTokens,
  openAIFunctions,
  ToolError,
} from "../utils/index.js";
import { tools } from "../tools/index.js";

import { ChatMessage } from "../models/index.js";
import { openai } from "../ai/utils.js";
import { promptSystemDefault } from "../ai/prompts.js";
import { getSocketIO } from "../socket.io-server.js";
import { MODEL } from "../../shared/config.js";

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

chatRoutes.get("/chat", async (req, res) => {
  const userMessage = ChatMessage.build({
    role: "user",
    content: req.query.message as string,
  });
  log(userMessage.toJSON());

  // create user message
  await userMessage.save();

  const callModel = async () => {
    // get all messages
    const dbMessages = await ChatMessage.findAll({
      order: [["createdAt", "ASC"]],
    });

    log(`/chat ${dbMessages.length} dbMessages`);

    const RESPONSE_TOKENS = Math.floor(MODEL.contextSize * 0.4);
    const CONTEXT_TOKENS = MODEL.contextSize - RESPONSE_TOKENS;
    const FUNCTIONS_TOKENS = countTokens(MODEL.name, chatGPTFunctionsPrompt);
    const SYSTEM_MESSAGE_TOKENS = countTokens(MODEL.name, promptSystemDefault);

    let messageTokensBudget =
      CONTEXT_TOKENS - FUNCTIONS_TOKENS - SYSTEM_MESSAGE_TOKENS;

    const contextMessages: ChatCompletionMessageParam[] = [];
    let messagesTokens = 0;

    while (dbMessages.length > 0 && messageTokensBudget > 0) {
      const message = dbMessages.pop();

      if (message.tokens > messageTokensBudget) {
        const TOKEN_BUFFER = 100;
        const LENGTH_BUFFER = TOKEN_BUFFER * 4; // ~1 token = 4 chars
        const percentTokensAvailable = message.tokens / messageTokensBudget;
        const maxContentLength =
          message.content.length * percentTokensAvailable - LENGTH_BUFFER;

        // keep as much of the tail of the last message that will fit in context
        message.content = message.content.slice(maxContentLength);
        messagesTokens += countTokens(MODEL.name, message.content);
        messageTokensBudget = 0;
        break;
      }

      messageTokensBudget -= message.tokens;
      messagesTokens += message.tokens;
      contextMessages.unshift(ChatMessageToOpenAIMessage(message));
    }

    log("/chat tokens", {
      budgetTotal: MODEL.contextSize,
      budgetContext: CONTEXT_TOKENS,
      budgetResponse: RESPONSE_TOKENS,
      contextFunctions: FUNCTIONS_TOKENS,
      contextSystem: SYSTEM_MESSAGE_TOKENS,
      contextMessages: messagesTokens,
      contextTotal: messagesTokens + FUNCTIONS_TOKENS + SYSTEM_MESSAGE_TOKENS,
    });

    // this is safe because we budgeted for it
    contextMessages.unshift({ role: "system", content: promptSystemDefault });

    log(
      `/chat ${contextMessages.length} messages ${messagesTokens} tokens`,
      contextMessages.map((m) => {
        return `${m.role}: ${m.content.slice(0, 20)}...`;
      }),
    );

    const io = getSocketIO();

    // Function call args stream in, build them up
    let func = "";
    let args = "";

    try {
      const replyMessage = await ChatMessage.create({
        role: "assistant",
        content: "",
      });

      const write = (message: string) => {
        replyMessage.content += message;

        io.emit("chatMessageStream", { id: replyMessage.id, chunk: message });
      };

      const saveAssistantReply = async () => {
        await replyMessage.save();
      };

      const stream = await openai.chat.completions.create({
        model: MODEL.name,
        messages: contextMessages,
        stream: true,
        n: 1,
        max_tokens: RESPONSE_TOKENS,
        functions: openAIFunctions,
        function_call: "auto",
      });

      // Stream
      // res.setHeader("Content-Type", "text/event-stream");
      for await (const part of stream) {
        const { delta, finish_reason } = part.choices[0];
        if (delta?.function_call?.name) {
          func = delta?.function_call?.name;
        }

        if (delta?.function_call?.arguments) {
          args += delta?.function_call?.arguments;
        }

        //
        // Stop
        //
        if (finish_reason === "stop") {
          log("finish_reason", finish_reason);
          await saveAssistantReply();
        }

        //
        // Content Length
        //
        else if (finish_reason === "length") {
          log("finish_reason", finish_reason);
          write("\n\n(...truncated due to max length)");
          await saveAssistantReply();
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

          await ChatMessage.create({
            role: "assistant",
            content: `\`${func}(${printArgs})\``,
            functionCall: { name: func, arguments: args },
          });

          // call function
          await callFunction(func, argsJSon);

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
      res.write(`\n\n500 Error: ${error.toString()}`);
      throw error;
    }

    log(
      "/chat end",
      contextMessages.map((m) => {
        return `${m.role}: ${m.content.slice(0, 20)}...`;
      }),
    );
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

  await callModel();
});
