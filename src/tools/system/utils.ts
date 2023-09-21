import { exec } from "child_process";
import path from "path";

import debug from "debug";

import { PROJECT_ROOT } from "../../config";
import { cleanShellOutput } from "../../utils";

export const log = debug("tools:system");

/**
 * Returns the current working directory for the active project.
 */
const getCWD = (cwd: string = ".") => path.resolve(PROJECT_ROOT, cwd);

/**
 * Returns information about the operating system and environment.
 */
export const getSystemInfo = async () => {
  const git = await run("git -v");

  const result = {
    platform: process.platform,
    arch: process.arch,
    shell: process.env.SHELL,
    cwd: getCWD(),
    git: git.stdout.replace(/[^0-9.]/g, ""),
    node: process.versions.node,
    yarn: await run("yarn -v").then(({ stdout }) => stdout),
    time: new Date().toLocaleString(),
  };

  log("getSystemInfo()", result);

  return result;
};

export const run = (
  command: string,
  cwd: string = ".",
): Promise<{
  error: any;
  stdout: string;
  stderr: string;
}> => {
  const options = {
    cwd: getCWD(cwd),
    shell: process.env.SHELL,
  };
  log("run()", command, options);

  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      resolve({
        error,
        stdout: cleanShellOutput(stdout),
        stderr: cleanShellOutput(stderr),
      });
    });
  });
};
