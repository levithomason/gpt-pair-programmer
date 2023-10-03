import * as fs from "fs";
import { globSync } from "glob";

import type { ToolFunction } from "../../../types.js";
import { absPath, relPath } from "../../../config.js";
import { run, ToolError } from "../../utils/index.js";

type Args = {
  query: string;
};

type Return = string[];

const getIgnorePatterns = (filePath: string): string[] => {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    return fs
      .readFileSync(filePath, "utf8")
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("#"))
      .map((line) => {
        // remove trailing and leading slashes
        if (line.endsWith("/")) line = line.slice(0, -1);
        if (line.startsWith("/")) line = line.slice(1);

        return `**/${line}/**`;
      });
  } catch (error) {
    throw new ToolError({
      tool: "fileFind",
      message: `Failed to read ${relPath(filePath)} (for filtering)`,
      error,
    });
  }
};

// TODO: generate openapi.yaml files from docstrings
/**
 * @summary Find a file
 * @desription
 * Searches full file path. Case-insensitive fuzzy search. Respects .gitignore and global .gitignore patterns.
 * @example
 * fileFind({ query: "mt" })
 * => "mine/was/foundThere.js", "My/Stuff/Is_There.js", etc.
 */
const fileFind: ToolFunction<Args, Return> = async ({ query }) => {
  const localGitignore = getIgnorePatterns(absPath(".gitignore"));
  const globalGitignore = [];

  try {
    const { stdout } = await run("git config --get core.excludesfile");
    globalGitignore.push(...getIgnorePatterns(absPath(stdout.trim())));
  } catch (error) {
    throw new ToolError({
      tool: "fileFind",
      message: "Failed to get global gitignore path",
      error,
    });
  }

  try {
    const pattern = `**/**${query.split("").join("*")}*`;
    const options = {
      ignore: ["**/.git/**", ...localGitignore, ...globalGitignore],
      dot: true,
      cwd: absPath("."),
      nocase: true,
    };

    return globSync(pattern, options);
  } catch (error) {
    throw new ToolError({
      tool: "fileFind",
      message: "Failed to create search",
      error,
    });
  }
};

export default fileFind;
