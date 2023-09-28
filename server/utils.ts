import fs from "fs";
import path from "path";
import { exec } from "child_process";

import debug from "debug";

import { PROJECT_ROOT, TERMINAL_STREAM_MAX_TOKENS } from "../config";

export const log = debug("gpp:server:utils");

export const relPath = (p: string) => path.relative(PROJECT_ROOT, p);

/**
 * Trims a string to a certain number of estimated tokens.
 * If the string is less than the number of tokens, the string is returned as-is.
 * If truncation is required, an "..." will be inserted in the middle of the string.
 * @param {string} str
 * @param {number} tokens
 */
export const trimStringToTokens = (str: string, tokens: number) => {
  const maxCharacters = tokens * 4;

  if (str.length > maxCharacters) {
    const divider = "\n\n[TRUNCATED]\n\n";
    const start = str.slice(0, maxCharacters / 2 - divider.length);
    const end = str.slice(-maxCharacters / 2 + divider.length);

    return start + divider + end;
  }

  return str;
};

/**
 * Removes ANSI escape codes (colors) from a string and trims it.
 */
export const cleanShellOutput = (str: string) => {
  return trimStringToTokens(
    str.replace(/\u001b\[.*?m/g, "").trim(),
    TERMINAL_STREAM_MAX_TOKENS,
  );
};

/**
 * Executes a shell command.
 */
export const run = (
  command: string,
  cwd: string = ".",
): Promise<{ error: any; stdout: string; stderr: string }> => {
  const options = {
    cwd: path.resolve(PROJECT_ROOT, cwd),
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

/**
 * Returns a tree for a given directory.
 */
export const generateTree = (dir: string, maxDepth: number = 1): string => {
  // node modules, dotfiles, and dot directories
  const skipRegex = /node_modules|^\..*/;
  const indent = "  ";

  const filterEntries = (entry: string) => {
    return entry !== ".DS_Store";
  };

  const isDirectory = (pathStr: string) => {
    return fs.lstatSync(pathStr).isDirectory();
  };

  const shouldIterate = (pathStr: string) => {
    const file = path.basename(pathStr);
    if (!isDirectory(pathStr)) {
      return false;
    }

    return !skipRegex.test(file);
  };

  const reportIgnored = (dir: string) => {
    let files = 0;
    let dirs = 0;
    fs.readdirSync(dir).forEach((entry) => {
      const nextPath = path.join(dir, entry);
      if (isDirectory(nextPath)) {
        dirs++;
      } else {
        files++;
      }
    });

    return [`IGNORE`, dirs && `${dirs} folders`, files && `${files} files`]
      .filter(Boolean)
      .join(" ");
  };

  const reportMaxDepth = (dir: string) => {
    let files = 0;
    let dirs = 0;
    fs.readdirSync(dir).forEach((entry) => {
      const nextPath = path.join(dir, entry);
      if (isDirectory(nextPath)) {
        dirs++;
      } else {
        files++;
      }
    });

    return [`MAX`, dirs && `${dirs} folders`, files && `${files} files`]
      .filter(Boolean)
      .join(" ");
  };

  const recurse = (dir: string, currentDepth: number): string => {
    if (currentDepth > maxDepth) {
      return "";
    }

    let localTree = "";

    const entries = fs
      .readdirSync(dir)
      .filter(filterEntries)
      .sort((a, b) => {
        const pathA = path.join(dir, a);
        const pathB = path.join(dir, b);

        if (isDirectory(pathA) && !isDirectory(pathB)) return -1;
        if (!isDirectory(pathA) && isDirectory(pathB)) return 1;
        return a < b ? -1 : 1;
      });

    const isMaxDepth = currentDepth === maxDepth;
    const currIndent = indent.repeat(currentDepth - 1);

    for (const entry of entries) {
      const nextPath = path.join(dir, entry);
      const isDir = isDirectory(nextPath);
      const willIterate = shouldIterate(nextPath);

      const dirSlash = isDir ? "/" : "";
      const itemCount =
        isDir && isMaxDepth
          ? ` (${reportMaxDepth(nextPath)})`
          : isDir && !willIterate
          ? ` (${reportIgnored(nextPath)})`
          : "";

      localTree += `${currIndent}${entry}${dirSlash}${itemCount}\n`;

      if (willIterate) {
        localTree += recurse(nextPath, currentDepth + 1);
      }
    }

    return localTree;
  };

  return [`MAX DEPTH: ${maxDepth}\n`, recurse(dir, 1)].join("\n");
};

// TODO: Tools that return extra properties in their return object don't throw a type error
//       ToolDefinition should be stricter
export type ToolFunction<ArgObj, Return = void> = (
  args: ArgObj,
) => Promise<Return>;

export class ToolError extends Error {
  constructor(tool: string, message: string) {
    super(message);
    this.name = tool + "Error";
  }
}

export class PairProgrammerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PairProgrammerError";
  }
}
