import fs from "fs";
import path from "path";

import express from "express";
import morgan from "morgan";
import cors from "cors";
import { json } from "body-parser";
import debug from "debug";
import yaml from "js-yaml";
import { OpenAI } from "openai";

import "./database";

import { PUBLIC_ROOT, SERVER_ROOT } from "../config";
import { OpenAIFunction, OpenAPISpec } from "./types";

const { OPENAI_API_KEY } = process.env;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}

const GENERATED_SPEC_PATH = path.join(SERVER_ROOT, "openapi.generated.yaml");

const log = debug("gpp:server:main");
debug.enable("gpp:*");

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

// ============================================================================
// Tool Routes
// ============================================================================
const tools: Array<{ operationId: string; fn: Function }> = [];

const toolsDir = path.join(__dirname, "tools");
const mainSpec = yaml.load(
  fs.readFileSync(path.join(SERVER_ROOT, "openapi.base.yaml"), "utf8"),
) as OpenAPISpec;

fs.readdirSync(toolsDir).forEach((tool) => {
  const toolDir = path.join(toolsDir, tool);

  fs.readdirSync(toolDir).forEach((file) => {
    const hasRoute = path.basename(file) === "routes.ts";

    if (!hasRoute) {
      return;
    }

    const printPath = path.relative(__dirname, toolDir);
    log("Load:", printPath);

    // Tool spec
    const toolSpecPath = path.join(toolsDir, tool, "openapi.yaml");
    if (!fs.existsSync(toolSpecPath)) {
      throw new Error(`Tool "${tool}" is missing an openapi.yaml spec.`);
    } else {
      const toolSpec = yaml.load(
        fs.readFileSync(toolSpecPath, "utf8"),
      ) as OpenAPISpec;
      mainSpec.paths = { ...mainSpec.paths, ...toolSpec.paths };
    }

    // Tool route
    try {
      const { addRoutes } = require(path.join(toolDir, file));
      addRoutes(app);

      // TODO: Add tools here
      //  need to separate tool fns from routes to call them more reasonably
    } catch (error) {
      log(`Error loading tool:`, error);
      process.exit(1);
    }
  });
});

const generatedSpec = [
  "# WARNING: This file is generated. Do not edit it directly.",
  "# To make changes, edit the root `openapi.base.yaml` or `tools/*/openapi.yaml` files.",
  yaml.dump(mainSpec),
].join("\n");

const relativeOpenAPIPath = path.relative(process.cwd(), GENERATED_SPEC_PATH);
log(`Generated ${relativeOpenAPIPath}`);
fs.writeFileSync(GENERATED_SPEC_PATH, generatedSpec);

// ============================================================================
// OpenAI Chat Routes
// ============================================================================
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const openapiSpec = yaml.load(generatedSpec) as OpenAPISpec;

export const convertOpenAPIToFunctions = (
  openAPISpec: OpenAPISpec,
): OpenAIFunction[] => {
  const functions: OpenAIFunction[] = [];

  for (const [path, info = {}] of Object.entries(openAPISpec.paths)) {
    for (const [method, details] of Object.entries(info)) {
      const name = details.operationId;
      const description = details.description;

      const openAPIProperties =
        details.requestBody?.content?.["application/json"]?.schema
          ?.properties || {};

      const required: OpenAIFunction["parameters"]["required"] = [];
      const properties: OpenAIFunction["parameters"]["properties"] = {};

      Object.entries(openAPIProperties).forEach(([name, property]) => {
        if (property.required) {
          delete property.required;
          required.push(name);
        }
        properties[name] = property;
      });

      const func: OpenAIFunction = {
        name,
        description,
        parameters: { type: "object", required, properties },
      };

      functions.push(func);
    }
  }

  return functions;
};

const functions = convertOpenAPIToFunctions(openapiSpec);

app.get("/chat", async (req, res) => {
  const message = req.query.message as string;
  log("/chat:", message);

  // TODO: count tokens & cost:
  //       - https://github.com/niieani/gpt-tokenizer
  //       - https://github.com/dqbd/tiktoken
  //   NOTE: OpenAPI responses include token "usage" if not streaming
  //   https://platform.openai.com/docs/api-reference/chat/object

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0613",
      messages: [
        // TODO: better system message, possibly expose setting to end user
        {
          role: "system",
          content:
            "You are a pair programmer with complete access to the user's computer.",
        },
        { role: "user", content: message },
      ],
      stream: true,
      n: 1,
      functions,
      function_call: "auto",
    });

    for await (const part of stream) {
      const choice = part.choices[0];

      //
      // Function call
      //
      if (choice.delta.function_call) {
        const name = choice.delta.function_call.name;
        const args = JSON.parse(choice.delta.function_call.arguments as string);
        log("/chat function call", name, args);

        // return early as is not yet implemented
        res
          .status(400)
          .json({ error: "Function calls are not yet supported." });
        return;

        // const tool = tools.find((t) => t.operationId === name);
        //
        // if (!tool) {
        //   res.status(400).json({ error: `Function "${name}" not found.` });
        //   return;
        // }
        //
        // try {
        //   const result = await tool.fn(args);
        //   log("/chat function result", result);
        // } catch (error) {
        //   log("/chat function error", error);
        //   res.status(500).json({ error: (error as Error).toString() });
        //   return;
        // }
      }

      //
      // Stream
      //
      res.setHeader("Content-Type", "text/event-stream");

      log("/chat", choice);
      // log("/chat finish_reason: ", choice.finish_reason);

      const text = choice.delta.content || "";
      // log("/chat content", text);
      res.write(text);
    }

    res.end();
  } catch (error) {
    res.status(500).json({ error: (error as Error).toString() });
  }
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
