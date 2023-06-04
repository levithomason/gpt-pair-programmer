import fs from "fs";
import { exec } from "child_process";

import express from "express";
import morgan from "morgan";
import cors from "cors";
import { json } from "body-parser";
import { trimStringToTokens } from "./utils";
import { getSessionState, setSessionState } from "./sessionState";
import path from "path";

const app = express();

const GPT_4_MAX_TOKENS = 8000;
const GPT_3_MAX_TOKENS = 4000;
const TERMINAL_STREAM_MAX_TOKENS = GPT_4_MAX_TOKENS / 3;

const PLUGIN_ROOT = path.resolve(__dirname, "..");

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
// File Operations
//

app.post("/file/load", async (req, res) => {
  const filePath = req.body.filePath;
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    setSessionState({
      file: {
        path: filePath,
        content: fileContent,
      },
    });
    res.status(200).send({ message: "File loaded successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .send({ message: "Error loading file", error: error.message });
    } else {
      res.status(500).send({ message: "Error loading file" });
    }
  }
});

app.post("/file/save", async (req, res) => {
  const { path, content } = getSessionState().file;
  try {
    fs.writeFileSync(path, content, "utf-8");
    res.status(200).send({ message: "File saved successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .send({ message: "Error saving file", error: error.message });
    } else {
      res.status(500).send({ message: "Error saving file" });
    }
  }
});

app.post("/file/edit", async (req, res) => {
  const { start, end, text } = req.body;
  const { path, content } = getSessionState().file;
  try {
    const newContent = content.slice(0, start) + text + content.slice(end);
    setSessionState({
      file: {
        path: path,
        content: newContent,
      },
    });
    res.status(200).send({ message: "File edited successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .send({ message: "Error editing file", error: error.message });
    } else {
      res.status(500).send({ message: "Error editing file" });
    }
  }
});

app.get("/file/content", async (_, res) => {
  const { content } = getSessionState().file;
  res.status(200).send({ content: content });
});

//
// GPT
//

app.get("/gpt/get-started", async (_, res) => {
  const filePath = path.resolve(PLUGIN_ROOT, "gpt-ignore/GPT_FIX_GITHUB_ISSUE.md");
  fs.readFile(filePath, "utf8", (error, data) => {
    res.setHeader("Content-Type", "application/json");
    res.status(error ? 500 : 200).send({ error, data });
  });
});

//
// System
//

app.get("/system/tree", async (req, res) => {
  const command = `tree -a -L 3 -F --noreport --filelimit 500 --dirsfirst -I "node_modules"`;
  const cwd = path.resolve(PLUGIN_ROOT, req.body.cwd || ".");

  console.log("/system/tree", { command, cwd });

  exec(command, { cwd }, (error, stdout, stderr) => {
    console.log("/system/tree", { error, stdout, stderr });
    res.status(200).json({
      error: error,
      stdout: trimStringToTokens(stdout, TERMINAL_STREAM_MAX_TOKENS),
      stderr: trimStringToTokens(stderr, TERMINAL_STREAM_MAX_TOKENS),
    });
  });
});

app.post("/system/exec", async (req, res) => {
  const command = req.body.command;
  const cwd = path.resolve(PLUGIN_ROOT, req.body.cwd || ".");

  console.log("/system/exec", { command, cwd });

  exec(command, { cwd }, (error, stdout, stderr) => {
    console.log("/system/exec", { error, stdout, stderr });
    res.status(200).json({
      error: error,
      stdout: trimStringToTokens(stdout, TERMINAL_STREAM_MAX_TOKENS),
      stderr: trimStringToTokens(stderr, TERMINAL_STREAM_MAX_TOKENS),
    });
  });
});

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
  console.log("cwd:", process.cwd());
});
