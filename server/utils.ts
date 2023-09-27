import fs from "fs";
import path from "path";
import { TERMINAL_STREAM_MAX_TOKENS } from "../config";

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
    const divider = "\n\n...\n\n";
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
