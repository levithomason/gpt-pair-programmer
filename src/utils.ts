import fs from "fs";
import path from "path";
import { TERMINAL_STREAM_MAX_TOKENS } from "./config";

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

    return file !== "node_modules" && !file.startsWith(".");
  };

  const recurse = (dir: string, currentDepth: number = 1): string => {
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

    for (const entry of entries) {
      const nextPath = path.join(dir, entry);
      const dirSlash = isDirectory(nextPath) ? "/" : "";
      localTree += `${indent.repeat(currentDepth - 1)}${entry}${dirSlash}\n`;

      if (shouldIterate(nextPath)) {
        localTree += recurse(nextPath, currentDepth + 1);
      }
    }

    return localTree;
  };

  return recurse(dir, 1);
};
