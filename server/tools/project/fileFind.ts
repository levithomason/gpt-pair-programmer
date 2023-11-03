import { globby } from "globby";

import type { ToolFunction } from "../../../shared/types.js";
import { ToolError } from "../../utils/index.js";
import { absProjectPath } from "../../settings.js";
import { getGlobalGitignoreGlobs } from "./utils.js";

type Args = {
  query: string;
};

type Return = string[];

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
  if (!query) {
    throw new ToolError({
      tool: "fileFind",
      message: "No query provided",
    });
  }

  const globalGitignoreGlobs = await getGlobalGitignoreGlobs();

  try {
    const pattern = `**/**${query.split("").join("*")}*`;
    return globby(pattern, {
      gitignore: true,
      ignore: ["**/.git/**", ...globalGitignoreGlobs],
      dot: true,
      cwd: absProjectPath(),
      caseSensitiveMatch: false,
      expandDirectories: true,
    });
  } catch (error) {
    throw new ToolError({
      tool: "fileFind",
      message: "Failed to create search",
      error,
    });
  }
};

export default fileFind;
