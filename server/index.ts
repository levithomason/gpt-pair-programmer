import fs from "fs";
import path from "path";

import express from "express";
import morgan from "morgan";
import cors from "cors";
import { json } from "body-parser";
import debug from "debug";
import yaml from "js-yaml";
import { OpenAI } from "openai";

import { PUBLIC_ROOT, SERVER_ROOT } from "../config";
import { OpenAPISpec } from "./types";

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

app.get("/chat", async (req, res) => {
  const message = req.query.message as string;
  log("/chat:", message);

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");

    for await (const part of stream) {
      const text = part.choices[0].delta.content || "";
      log("/chat stream:", text);
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
        console.error(err);
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
      console.error(error);
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
  console.log("Server running on http://0.0.0.0:5004");
});
