import path from "path";
import fs from "fs";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { json } from "body-parser";

import { GPT_4_MAX_TOKENS, PROJECT_ROOT } from "./config";
import { addSystemRoutes } from "./system/routes";
import { addGitHubRoutes } from "./github/routes";

const app = express();

// ============================================================================
// Middleware
// ============================================================================

app.use(morgan("dev"));
app.use(cors({ origin: "https://chat.openai.com" }));
app.use(json());

// ============================================================================
// API
// ============================================================================

//
// GitHub
//
addGitHubRoutes(app);

//
// File Operations
//

// ChatGPT was not able to edit files based on start/end position or line/column
// addFileEditPositionRoutes(app);

// ChatGPT was not able to use a text based file editor
// addFileEditorRoutes(app);

//
// GPT
//

app.get("/gpt/get-started", async (_, res) => {
  const filePath = path.resolve(
    PROJECT_ROOT,
    "gpt-ignore/GPT_FIX_GITHUB_ISSUE.md",
  );
  fs.readFile(filePath, "utf8", (error, data) => {
    res.setHeader("Content-Type", "application/json");
    res.status(error ? 500 : 200).send({ error, data });
  });
});

//
// System
//

addSystemRoutes(app);

//
// OpenAI Plugin
//

app.get("/logo.png", async (_, res) => {
  const filename = "logo.png";
  res.sendFile(filename, { root: "." });
});

app.get("/.well-known/ai-plugin.json", async (_, res) => {
  fs.readFile(".well-known/ai-plugin.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error");
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(data);
  });
});

app.get("/openapi.yaml", async (_, res) => {
  fs.readFile("openapi.yaml", "utf8", (error, data) => {
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
