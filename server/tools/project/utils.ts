import fs from "fs";
import path from "path";

import debug from "debug";
import { PROJECT_ROOT } from "../../../config";

export const log = debug("gpp:tools:project");

/**
 * Extracts TODO comments from a file.
 * Handles //, /*, and /** comments.
 * Includes the entire comment which contains the word "TODO".
 */
export function findTODOsInFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const todoComments = [];

  const singleLineCommentRegex = /\/\/.*TODO.*$/gm;
  const multiLineCommentRegex = /\/\*[\s\S]*?TODO[\s\S]*?\*\//gm;

  const singleLineMatches = content.match(singleLineCommentRegex) || [];
  const multiLineMatches = content.match(multiLineCommentRegex) || [];

  for (const match of singleLineMatches) {
    const lineNumber = content
      .slice(0, content.indexOf(match))
      .split("\n").length;
    todoComments.push({ line: lineNumber, comment: match.trim() });
  }

  for (const match of multiLineMatches) {
    const lineNumber = content
      .slice(0, content.indexOf(match))
      .split("\n").length;
    todoComments.push({ line: lineNumber, comment: match.trim() });
  }

  return todoComments;
}

/**
 * Recursively searches a directory for TODO comments.
 */
export function findTODOsInDirectory(dirPath: string) {
  const results: { [dir: string]: { line: number; comment: string }[] } = {};
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (file.startsWith(".") || file.startsWith("node_modules")) {
      continue;
    }

    if (stats.isDirectory()) {
      Object.assign(results, findTODOsInDirectory(fullPath));
    } else {
      if (stats.isFile() && /\.(ts|tsx|js|jsx|cjs)?$/.test(file)) {
        const todos = findTODOsInFile(fullPath);

        if (todos.length > 0) {
          const relPath = path.relative(PROJECT_ROOT, fullPath);
          results[relPath] = todos;
        }
      }
    }
  }

  return results;
}
