import { exec } from "child_process";
import path from "path";
import { Express } from "express";
import { ESLint } from "eslint";

import { trimStringToTokens } from "../utils";
import { GPT_4_MAX_TOKENS, GPT_HOME } from "../config";

const TERMINAL_STREAM_MAX_TOKENS = GPT_4_MAX_TOKENS / 3;

const getCWD = (cwd: string = ".") => path.resolve(GPT_HOME, cwd);

const run = (
  command: string,
  cwd: string = ".",
): Promise<{
  error: any;
  stdout: string;
  stderr: string;
}> => {
  const safeCWD = getCWD(cwd);
  console.log("  RUN:", { command, cwd: safeCWD });

  return new Promise((resolve, reject) => {
    exec(command, { cwd: safeCWD }, (error, stdout, stderr) => {
      resolve({
        error: error,
        stdout: trimStringToTokens(stdout, TERMINAL_STREAM_MAX_TOKENS).trim(),
        stderr: trimStringToTokens(stderr, TERMINAL_STREAM_MAX_TOKENS).trim(),
      });
    });
  });
};

/**
 * Returns information about the operating system and environment.
 */
const getSystemInfo = async () => {
  const git = await run("git -v");

  return {
    cwd: getCWD(),
    arch: process.arch,
    platform: process.platform,
    shell: process.env.SHELL,
    git: git.stdout.replace(/[^0-9.]/g, ""),
    node: process.versions.node,
    prettier: require("prettier/package.json").version,
    eslint: require("eslint/package.json").version,
    time: new Date().toISOString(),
  };
};

const isCommitNeeded = async () => {
  const status = await run("git status --porcelain");
  return status.stdout.trim() !== "";
};

const runLint = async () => {
  try {
    const eslint = new ESLint();
    const results = await eslint.lintFiles([getCWD()]);
    const formatter = await eslint.loadFormatter("stylish");
    const result = await formatter.format(results);

    return {
      error: null,
      result: result
        // remove console colors from the output
        .replace(/\u001b\[.*?m/g, "")

        // make paths relative to the project root
        .replace(new RegExp(getCWD(), "g"), "")

        // make console output into an array of lines
        .split("\n")

        // remove empty lines
        .reduce((acc: string[], line: string) => {
          if (line.trim() !== "") {
            acc.push(line);
          }
          return acc;
        }, []),
    };
  } catch (error) {
    return {
      error,
      result: null,
    };
  }
};

const runPrettier = async () => {
  try {
    const result = await run(`cd ${getCWD()} && prettier --write "."`);

    return {
      error: null,
      result: result.stdout,
    };
  } catch (error) {
    return {
      error,
      result: null,
    };
  }
};

export const addSystemRoutes = (app: Express) => {
  app.get("/system/info", async (req, res) => {
    const systemInfo = await getSystemInfo();

    res.status(200).json(systemInfo);
  });

  app.post("/system/exec", async (req, res) => {
    const { command, reason, cwd } = req.body;

    const shell = await run(command, cwd);
    console.log("system/exec", { cwd, command, shell });

    const shouldCommit = await isCommitNeeded();

    const lint = await runLint();
    console.log("...lint", lint);

    const prettier = await runPrettier();
    console.log("...prettier", prettier);

    if (shouldCommit) {
      console.log("...committing changes:", reason);
      await run(`git add -A .`);
      await run(`git commit -m "gpt: ${reason}"`);
    }

    res.status(200).json({ lint, shell, prettier });
  });

  app.get("/system/tree", async (req, res) => {
    const command = `tree -a -L 3 -F --noreport --filelimit 500 --dirsfirst -I "node_modules"`;
    const { cwd } = req.body.cwd;
    console.log("/system/tree", { command, cwd });

    const result = await run(command, cwd);
    console.log("system/tree", result);

    const system = await getSystemInfo();
    res.status(200).json({ result, system: system });
  });

  app.post("/system/lint", async (req, res) => {
    const result = await runLint();

    res.json(result);
  });
};
