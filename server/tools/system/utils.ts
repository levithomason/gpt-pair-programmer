import path from "path";

import axios from "axios";
import debug from "debug";

import { PROJECT_ROOT } from "../../../config";
import { run } from "../../utils";

export const log = debug("gpp:tools:system");

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
    cwd: PROJECT_ROOT,
    git: git.stdout.replace(/[^0-9.]/g, ""),
    node: process.versions.node,
    yarn: await run("yarn -v").then(({ stdout }) => stdout),
    time: new Date().toLocaleString(),
  };

  log("getSystemInfo()", result);

  return result;
};

/**
 * Returns the current location of the user's system.
 */
export const getSystemLocation = async () => {
  log("getSystemLocation()");
  try {
    const response = await axios.get("https://ipinfo.io/json");
    return response.data;
  } catch (err) {
    return { error: (err as Error).toString() };
  }
};
