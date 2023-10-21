import fs from "fs/promises";
import debug from "debug";
import { run } from "../../utils/index.js";
import { absProjectPath } from "../../settings.js";
import { resolveHomePath } from "../../paths.js";

const log = debug("gpp:server:tools:project:utils");

const gitignoreToGlobs = async (gitignorePath: string): Promise<string[]> => {
  if (!(await fs.stat(gitignorePath)).isFile()) {
    return [];
  }

  const gitignore = await fs.readFile(gitignorePath, "utf8");

  return gitignore
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.startsWith("#"));
};

export const getGlobalGitignoreGlobs = async () => {
  log(`getGlobalGitignoreGlobs`);
  const { stdout } = await run("git config --get core.excludesfile");
  return gitignoreToGlobs(resolveHomePath(stdout.trim()));
};

export const getLocalGitignoreGlobs = async () => {
  log(`getLocalGitignoreGlobs`);
  const gitignorePath = absProjectPath(".gitignore");
  return gitignoreToGlobs(gitignorePath);
};
