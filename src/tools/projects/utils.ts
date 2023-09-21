import { exec } from "child_process";
import { ESLint } from "eslint";
import path from "path";
import debug from "debug";

import { GPT_PROJECTS } from "../../config";
import { cleanShellOutput, generateTree } from "../../utils";

const logRun = debug("server:system:run");
const logESLint = debug("server:system:eslint");

/**
 * Returns a tree of the current project.
 */
export const generateProjectTree = (project: string) => {
  if (!project) {
    return null;
  }

  return generateTree(path.resolve(GPT_PROJECTS, project), 2);
};

/**
 * Returns the current working directory for the active project.
 */
export const getCWD = (cwd: string = ".") => {
  const { activeProject = "" } = require("./state.json");

  return path.resolve(GPT_PROJECTS, activeProject, cwd);
};

export const run = (
  command: string,
  cwd: string = ".",
): Promise<{
  error: any;
  stdout: string;
  stderr: string;
}> => {
  const safeCWD = getCWD(cwd);
  logRun(command);

  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        cwd: safeCWD,
        shell: process.env.SHELL,
      },
      (error, stdout, stderr) => {
        resolve({
          error,
          stdout: cleanShellOutput(stdout),
          stderr: cleanShellOutput(stderr),
        });
      },
    );
  });
};

/**
 * Returns true if there are uncommitted changes in the current git repository.
 */
export const isCommitNeeded = async () => {
  const status = await run("git status --porcelain");
  return status.stdout.trim() !== "";
};

/**
 * Runs ESLint on the current project.
 */
export const runESLint = async () => {
  let ret = null;

  try {
    const eslint = new ESLint({
      cwd: getCWD(),
      errorOnUnmatchedPattern: false,
    });
    const results = await eslint.lintFiles([getCWD()]);
    const formatter = await eslint.loadFormatter("stylish");
    const formatted = await formatter.format(results);

    const parsedResult = formatted
      // remove console colors from the output
      .replace(/\u001b\[.*?m/g, "")
      // make paths relative to the project root
      .replace(new RegExp(getCWD(), "g"), "")
      .trim();

    ret = parsedResult || "OK";
  } catch (error) {
    ret = {
      error,
      result: null,
    };
  }

  logESLint(ret);
  return ret;
};

/**
 * Runs Prettier on the current project.
 */
export const runPrettier = async () => {
  const result = await run(
    `cd ${getCWD()} && prettier --write "." --no-error-on-unmatched-pattern`,
  );
  return result.error || result.stderr ? result : "OK";
};
