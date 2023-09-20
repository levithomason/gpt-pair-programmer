import { exec } from "child_process";
import path from "path";
import { Express } from "express";
import { ESLint } from "eslint";

import { trimStringToTokens } from "../utils";
import { GPT_4_MAX_TOKENS, GPT_HOME, PROJECT_ROOT } from "../config";

// response object has stdout, stderr, plus eslint results
// limit those as they can be very large
const TERMINAL_STREAM_MAX_TOKENS = GPT_4_MAX_TOKENS / 8;

// const getCWD = (cwd: string = ".") => path.resolve(GPT_HOME, cwd);
const getCWD = (cwd: string = ".") => path.resolve(PROJECT_ROOT, cwd);

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
      const stdoutClean = trimStringToTokens(stdout, TERMINAL_STREAM_MAX_TOKENS)
        // remove console colors from the output
        .replace(/\u001b\[.*?m/g, "")
        .trim();

      const stderrClean = trimStringToTokens(stderr, TERMINAL_STREAM_MAX_TOKENS)
        // remove console colors from the output
        .replace(/\u001b\[.*?m/g, "")
        .trim();

      resolve({ error, stdout: stdoutClean, stderr: stderrClean });
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

const runJest = async () => {
  const result = await run(
    [
      `yarn node --experimental-vm-modules`,
      `$(yarn bin jest) ${getCWD()}`,
      `--bail=1`,
      `--reporters="jest-silent-reporter"`,
      `--reporters="summary"`,
    ].join(" "),
  );
  return result.error?.code !== 0 ? result : "OK";
};
const runESLint = async () => {
  try {
    const eslint = new ESLint({
      cwd: getCWD(),
      errorOnUnmatchedPattern: false,
    });
    const results = await eslint.lintFiles([getCWD()]);
    const formatter = await eslint.loadFormatter("stylish");
    const result = await formatter.format(results);

    const parsedResult = result
      // remove console colors from the output
      .replace(/\u001b\[.*?m/g, "")
      // make paths relative to the project root
      .replace(new RegExp(getCWD(), "g"), "")
      .trim();

    return parsedResult || "OK";
  } catch (error) {
    return {
      error,
      result: null,
    };
  }
};

const runPrettier = async () => {
  const result = await run(
    `cd ${getCWD()} && prettier --write "." --no-error-on-unmatched-pattern`,
  );
  return result.error || result.stderr ? result : "OK";
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

    let eslint = null;
    let prettier = null;
    // let jest = null;

    if (shouldCommit) {
      eslint = await runESLint();
      console.log("...eslint", eslint);

      prettier = await runPrettier();
      console.log("...prettier", prettier);

      // jest = await runJest();
      // console.log("...jest", jest);

      console.log("...committing changes:", reason);
      await run(`git add -A .`);
      await run(`git commit -m "gpt: ${reason}"`);
    }

    res.status(200).json({ shell, eslint, prettier /*, jest */ });
  });

  // app.get("/system/tree", async (req, res) => {
  //   const command = `tree -a -L 3 -F --noreport --filelimit 500 --dirsfirst -I "node_modules"`;
  //   const cwd = req.body.cwd;
  //   console.log("/system/tree", { command, cwd });
  //
  //   const result = await run(command, cwd);
  //   console.log("system/tree", result);
  //
  //   res.status(200).json(result);
  // });
};
