import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/index.js";
import express from "express";
import debug from "debug";

import { OPENAI_MODELS } from "../../config.js";
import {
  BaseError,
  openAIFunctions,
  ToolError,
  trimStringToTokens,
} from "../utils/index.js";
import { tools } from "../tools/index.js";

import { ChatMessage } from "../models/index.js";

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

// TODO: add an env solution to handle env vars and validation
const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  throw new BaseError("Missing OPENAI_API_KEY environment variable.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// TODO: this should be moved to state and selectable by the user
const MODEL = OPENAI_MODELS["gpt-3.5-turbo"];

export const chatRoutes = express.Router();

chatRoutes.post("/chat/new", async (req, res) => {
  await ChatMessage.sync({ force: true });

  // TODO: better system message, possibly expose setting to end user
  await ChatMessage.create({
    role: "system",
    content: [
      "You are pair programming with the user on their computer.",
      "All your functions are executed on the user's computer with the user's permissions.",
      "Use markdown codeblocks in mermaid language to make charts, graphs, or diagrams to explain relationships.",
      "",
      "Be concise. Be informative. Get straight to the point.",
      "",
      "Never claim you are unable to accomplish a goal.",
      "Make a plan to accomplish the goal using your tools.",
      "",
      "Always use your tools to accomplish your tasks.",
      "Never assume you know something, check using your tools.",
    ].join("\n"),
  });

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

  // TODO: count tokens & cost:
  //       - https://github.com/niieani/gpt-tokenizer
  //       - https://github.com/dqbd/tiktoken
  //   NOTE: OpenAPI responses include token "usage" if not streaming
  //   https://platform.openai.com/docs/api-reference/chat/object

  const callModel = async () => {
    // get all messages
    const dbMessages = await ChatMessage.findAll();
    const messages = dbMessages.map(ChatMessageToOpenAIMessage);

    // TODO: crude measure of function call cost
    let lenOfAllMessages = JSON.stringify(openAIFunctions).length;

    const trimmedMessages = messages
      .map((message) => {
        lenOfAllMessages += JSON.stringify(message).length;
        return message;
      })
      .map((message) => {
        const percentageOfTotal =
          lenOfAllMessages / JSON.stringify(message).length;
        return {
          ...message,
          content: trimStringToTokens(
            message.content,
            percentageOfTotal * MODEL.contextMaxTokens * 0.52, // leave headroom
          ),
        };
      });

    log("/chat callModel", trimmedMessages);

    let assistantReply = "";

    // Determine next best step
    // const nextBestStep = await openai.chat.completions.create({
    //   model: MODEL.name,
    //   messages: [
    //     {
    //       role: "system",
    //       content: [
    //         "Determine the best next step:",
    //         "1: Get more information",
    //         "2: Make a plan",
    //         "3: Take action",
    //         "",
    //         "Respond with this schema:",
    //         "<number>",
    //       ].join("\n"),
    //     },
    //     ...trimmedMessages,
    //   ],
    //   stream: false,
    //   n: 1,
    //   functions: openAIFunctions,
    //   function_call: "none",
    // });
    //
    // log("nextBestStep", nextBestStep);
    //
    // res.write(nextBestStep.choices[0].message.content);

    try {
      const stream = await openai.chat.completions.create({
        model: MODEL.name,
        messages: trimmedMessages,
        stream: true,
        n: 1,
        functions: openAIFunctions,
        function_call: "auto",
      });

      // Function call args stream in, build them up
      let func = "";
      let args = "";

      const write = (message: string) => {
        assistantReply += message;
        res.write(message);
      };

      const saveAssistantReply = async () => {
        await ChatMessage.create({
          role: "assistant",
          content: assistantReply,
        });
      };

      // Stream
      // res.setHeader("Content-Type", "text/event-stream");
      for await (const part of stream) {
        const { delta, finish_reason } = part.choices[0];
        if (finish_reason === "stop") {
          log("finish_reason", finish_reason);
          await saveAssistantReply();
          break;
        }

        if (finish_reason === "length") {
          log("finish_reason", finish_reason);
          write("\n\n(...truncated due to max length)");
          await saveAssistantReply();
          break;
        }

        if (delta?.function_call?.name) {
          func = delta?.function_call?.name;
        }

        if (delta?.function_call?.arguments) {
          args += delta?.function_call?.arguments;
        }

        //
        // Call function
        //
        if (finish_reason === "function_call") {
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
        // Send text
        //
        if (finish_reason === null) {
          if (typeof delta.content === "string") {
            write(delta.content);
          }
        } else {
          write(`\n\nUnknown finish_reason "${finish_reason}"\n\n`);
          log("unknown finish_reason", finish_reason);
        }
      }
    } catch (error) {
      res.write('\n\n500 Error: "' + error + '"' + "\n\n");
      res.status(500).write((error as Error).toString());
    }

    log("/chat end", messages);
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
      const result = await tool(args);

      await ChatMessage.create({
        role: "function",
        name: func,
        content: JSON.stringify(result),
      });

      return result;
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
