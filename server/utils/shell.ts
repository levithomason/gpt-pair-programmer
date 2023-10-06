import * as path from "path";
import type { ExecException } from "child_process";
import { exec } from "child_process";

import debug from "debug";
import { PROJECT_ROOT } from "../config.js";

const log = debug("gpp:server:utils:shell");

/**
 * Removes ANSI escape codes (colors) from a string and trims it.
 */
export const cleanShellOutput = (str: string) => {
  return str.replace(/\u001b\[.*?m/g, "").trim();
};

export type RunReturn = {
  error: ExecException | null;
  stdout: string;
  stderr: string;
};

/**
 * Executes a shell command.
 */
export const run = (command: string, cwd: string = "."): Promise<RunReturn> => {
  const options = {
    cwd: path.resolve(PROJECT_ROOT, cwd),
    shell: process.env.SHELL,
  };
  log("run()", command, options);

  return new Promise((resolve) => {
    exec(command, options, (error, stdout, stderr) => {
      resolve({
        error,
        stdout: cleanShellOutput(stdout),
        stderr: cleanShellOutput(stderr),
      });
    });
  });
};
