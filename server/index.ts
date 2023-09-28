import fs from "fs";
import path from "path";

import express from "express";
import session from "express-session";
import morgan from "morgan";
import cors from "cors";
import { json } from "body-parser";
import debug from "debug";
import yaml from "js-yaml";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { tools } from "./tools";
import "./database";

import { OPENAI_MODELS, PUBLIC_ROOT, SERVER_ROOT, TOOLS_ROOT } from "../config";
import { OpenAIFunction, OpenAPIMethod, OpenAPISpec } from "./types";
import {
  PairProgrammerError,
  relPath,
  ToolError,
  trimStringToTokens,
} from "./utils";

debug.enable("gpp:*");

const { OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY) {
  throw new PairProgrammerError("Missing OPENAI_API_KEY environment variable.");
}

const BASE_SPEC_PATH = path.join(SERVER_ROOT, "openapi.base.yaml");
const GENERATED_SPEC_PATH = path.join(SERVER_ROOT, "openapi.generated.yaml");

const baseSpec = yaml.load(
  fs.readFileSync(BASE_SPEC_PATH, "utf8"),
) as OpenAPISpec;

const log = debug("gpp:server:main");

const app = express();

// ============================================================================
// Middleware
// ============================================================================

app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://chat.openai.com",
      "http://0.0.0.0:5004",
    ],
  }),
);
app.use(json());

// session
const sess = {
  secret: "foo bar baz",
  cookie: { secure: false },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

// ============================================================================
// Aggregate OpenAPI Tool Specs
// ============================================================================

fs.readdirSync(TOOLS_ROOT).forEach((tool) => {
  const toolDir = path.join(TOOLS_ROOT, tool);
  if (!fs.statSync(toolDir).isDirectory()) {
    return;
  }

  const specPath = path.join(toolDir, "openapi.yaml");
  if (!fs.existsSync(specPath)) {
    throw new PairProgrammerError(
      `Tool "${relPath(toolDir)}" is missing an openapi.yaml spec.`,
    );
  }

  log("Aggregating:", relPath(specPath));
  const specYaml = fs.readFileSync(specPath, "utf8");
  const specJson = yaml.load(specYaml) as OpenAPISpec;

  baseSpec.paths = { ...baseSpec.paths, ...specJson.paths };
});

const generatedSpecYaml = [
  "# WARNING: This file is generated. Do not edit it directly.",
  "# To make changes, edit the root `openapi.base.yaml` or `tools/*/openapi.yaml` files.",
  yaml.dump(baseSpec),
].join("\n");

fs.writeFileSync(GENERATED_SPEC_PATH, generatedSpecYaml);
log(`Generated: ${relPath(GENERATED_SPEC_PATH)}`);
const generatedSpecJson = yaml.load(generatedSpecYaml) as OpenAPISpec;

// ============================================================================
// Parse Generated OpenAPI Spec
// ============================================================================

// const tools: Record<string, ToolFunction<any, any>> = {};
const openAIFunctions: OpenAIFunction[] = [];

const parseOpenAPISpec = (openAPISpec: OpenAPISpec): OpenAIFunction[] => {
  for (const [endpoint, methods] of Object.entries(openAPISpec.paths)) {
    for (const [method, details] of Object.entries(methods)) {
      const { operationId, description } = details;
      const requestBodyProperties =
        details.requestBody?.content?.["application/json"]?.schema
          ?.properties || {};

      // //
      // // Build tools object { [endpoint]: toolFn }
      // //
      // const toolType = endpoint.split("/")[1];
      // const toolFile = operationId + `.ts`;
      // const toolPath = path.resolve(TOOLS_ROOT, toolType, toolFile);
      //
      // try {
      //   tools[endpoint] = require(toolPath).default;
      // } catch (err) {
      //   log(`failed to require() tool: ${toolPath}`);
      //   const toolFiles = fs.readdirSync(path.resolve(TOOLS_ROOT, toolType));
      //   throw new PairProgrammerError(
      //     [
      //       `OpenAPI ${endpoint} ${operationId} doesn't match any ${toolType} tool:`,
      //       ...toolFiles.map((file) => `  - ${file}`),
      //     ].join("\n"),
      //   );
      // }
      //
      // if (!tools[endpoint]) {
      //   throw new PairProgrammerError(
      //     `Tool "${toolFile}" does not have a default export.`,
      //   );
      // }

      //
      // Dynamically add routes for each tool
      //
      app[method as OpenAPIMethod](endpoint, async (req, res) => {
        log(method, endpoint, "args:", req.body);

        // pick the args from the request body based on the OpenAPI spec
        const args = Object.keys(requestBodyProperties).reduce(
          (acc, next) => {
            acc[next] = req.body[next];
            return acc;
          },
          {} as Record<string, any>,
        );

        const tool = tools[operationId];

        if (!tool) {
          res.status(400).json({ error: `Tool ${operationId} not found.` });
          return;
        }

        try {
          log(endpoint, { tool });
          const data = await tool(args);
          log(endpoint, data);
          res.status(200).send(data);
        } catch (error) {
          if (error instanceof ToolError) {
            res.status(400).json({ error: error.toString() });
          } else {
            res.status(500).json({ error: (error as Error).toString() });
          }
        }
      });

      //
      // Build OpenAI functions
      //
      const required: OpenAIFunction["parameters"]["required"] = [];
      const properties: OpenAIFunction["parameters"]["properties"] = {};

      Object.entries(requestBodyProperties).forEach(([name, property]) => {
        if (property.required) {
          delete property.required;
          required.push(name);
        }
        properties[name] = property;
      });

      const func: OpenAIFunction = {
        name: operationId,
        description,
        parameters: { type: "object", properties, required },
      };

      openAIFunctions.push(func);
    }
  }

  return openAIFunctions;
};

parseOpenAPISpec(generatedSpecJson);

// log("openAIFunctions", JSON.stringify(openAIFunctions, null, 2));

// ============================================================================
// Chat Route
// ============================================================================

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// TODO: better system message, possibly expose setting to end user
const systemMessage: ChatCompletionMessageParam = {
  role: "system",
  content: [
    "You are the world's wisest pair programmer AI with thousands of years of combined experience.",
    "You are running on complete access to the user's computer.",
  ].join("\n"),
};

let messageStack: ChatCompletionMessageParam[] = [systemMessage];

const MODEL = OPENAI_MODELS["gpt-3.5-turbo"];

app.post("/chat/new", async (req, res) => {
  messageStack = [systemMessage];
  res.json(messageStack);
});

app.get("/chat", async (req, res) => {
  const message = req.query.message as string;
  log("/chat", message);

  const userMessage: ChatCompletionMessageParam = {
    role: "user",
    content: message,
  };

  messageStack.push(userMessage);

  // TODO: count tokens & cost:
  //       - https://github.com/niieani/gpt-tokenizer
  //       - https://github.com/dqbd/tiktoken
  //   NOTE: OpenAPI responses include token "usage" if not streaming
  //   https://platform.openai.com/docs/api-reference/chat/object

  const callModel = async (messages: ChatCompletionMessageParam[]) => {
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

      // Stream
      // res.setHeader("Content-Type", "text/event-stream");
      for await (const part of stream) {
        const { delta, finish_reason } = part.choices[0];
        if (finish_reason === "stop") {
          log("finish_reason", finish_reason);
          break;
        }

        if (finish_reason === "length") {
          log("finish_reason", finish_reason);
          res.write("\n\n(...truncated due to max length)");
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
          res.write(` \`\n${func}(${printArgs})\` `);

          // parse args
          let argsJSon = {};
          try {
            argsJSon = JSON.parse(args);
          } catch (error) {
            log("JSON.parse(args) Fail", error);
            res.write(`\n\nError parsing JSON: "${error}"\n\n`);
            // TODO: break? retry? The function will not get the correct args.
          }

          // call function
          const result = await callFunction(func, argsJSon);
          const content = JSON.stringify(result);
          messageStack.push({ role: "function", name: func, content });

          return await callModel(messageStack);
        }

        //
        // Send text
        //
        if (finish_reason === null) {
          if (typeof delta.content === "string") {
            res.write(delta.content);
          }
        } else {
          res.write(`\n\nUnknown finish_reason "${finish_reason}"\n\n`);
          log("unknown finish_reason", finish_reason);
        }
      }
    } catch (error) {
      res.write('\n\n500 Error: "' + error + '"' + "\n\n");
      res.status(500).write((error as Error).toString());
    }

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

  await callModel(messageStack);
});

// ============================================================================
// OpenAI Plugin Routes
// ============================================================================

app.get("/logo.png", async (_, res) => {
  const filename = "logo-white-bg.png";
  res.sendFile(filename, { root: PUBLIC_ROOT });
});

app.get("/.well-known/ai-plugin.json", async (_, res) => {
  fs.readFile(
    path.resolve(SERVER_ROOT, ".well-known", "ai-plugin.json"),
    "utf8",
    (err, data) => {
      if (err) {
        log(err);
        res.status(500).send("Error");
        return;
      }
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(data);
    },
  );
});

app.get("/openapi.yaml", async (_, res) => {
  fs.readFile(GENERATED_SPEC_PATH, "utf8", (error, data) => {
    if (error) {
      log(error);
      res.status(500).send("Error");
      return;
    }
    res.setHeader("Content-Type", "text/yaml");
    res.status(200).send(data);
  });
});

// ============================================================================
// Server
// ============================================================================

app.listen(5004, "0.0.0.0", () => {
  log("Server running on http://0.0.0.0:5004");
});
