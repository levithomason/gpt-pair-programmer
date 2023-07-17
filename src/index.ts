import { exec } from "child_process";
import path from "path";
import fs from "fs";

import axios from "axios";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { json } from "body-parser";

import { trimStringToTokens } from "./utils";
import { GPT_4_MAX_TOKENS, PROJECT_ROOT } from "./config";
import { addFileEditorRoutes } from "./file-editor/routes";

interface SimplifiedComment {
  user: string;
  comment: string;
  likes: number;
}

interface CommentsResponse {
  issueLink: string;
  comments: SimplifiedComment[];
}

interface SimplifiedPRComment {
  user: string;
  comment: string;
  likes: number;
}

interface PRCommentsResponse {
  pullLink: string;
  comments: SimplifiedPRComment[];
}

interface GitHubUser {
  login: string;
  type: string;
  // other fields...
}

interface GitHubReaction {
  total_count: number;
  // other fields...
}

interface GitHubComment {
  user: GitHubUser;
  body: string;
  reactions: GitHubReaction;
  html_url: string;
  // other fields...
}

const TERMINAL_STREAM_MAX_TOKENS = GPT_4_MAX_TOKENS / 3;

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

app.get("/github/comments/:owner/:repo/:issue", async (req, res) => {
  const { owner, repo, issue } = req.params;

  try {
    const response = await axios.get<GitHubComment[]>(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issue}/comments`
    );

    const comments: GitHubComment[] = response.data;

    const simplifiedComments: SimplifiedComment[] = comments
      .filter((comment) => comment.user.type !== "Bot") // Exclude bot comments
      .map((comment) => ({
        user: comment.user.login,
        comment: comment.body,
        likes: comment.reactions.total_count,
      }));

    const commentsResponse: CommentsResponse = {
      issueLink: `https://github.com/${owner}/${repo}/issues/${issue}`,
      comments: simplifiedComments,
    };

    res.json(commentsResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching comments.");
  }
});

app.get("/github/pr-comments/:owner/:repo/:pull", async (req, res) => {
  const { owner, repo, pull } = req.params;

  try {
    const response = await axios.get<GitHubComment[]>(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull}/comments`
    );

    const comments: GitHubComment[] = response.data;

    const simplifiedComments: SimplifiedPRComment[] = comments
      .filter((comment) => comment.user.type !== "Bot") // Exclude bot comments
      .map((comment) => ({
        user: comment.user.login,
        comment: comment.body,
        likes: comment.reactions.total_count,
      }));

    const prCommentsResponse: PRCommentsResponse = {
      pullLink: `https://github.com/${owner}/${repo}/pull/${pull}`,
      comments: simplifiedComments,
    };

    res.json(prCommentsResponse);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching comments.");
  }
});

//
// File Operations
//

// ChatGPT was not able to edit files based on start/end position or line/column
// addFileEditPositionRoutes(app);

addFileEditorRoutes(app);

//
// GPT
//

app.get("/gpt/get-started", async (_, res) => {
  const filePath = path.resolve(
    PROJECT_ROOT,
    "gpt-ignore/GPT_FIX_GITHUB_ISSUE.md"
  );
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
  const cwd = path.resolve(PROJECT_ROOT, req.body.cwd || ".");

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
  const cwd = path.resolve(PROJECT_ROOT, req.body.cwd || ".");

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
