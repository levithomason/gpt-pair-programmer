import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import debug from "debug";

import type { ToolFunction } from "../../types.js";
import { BaseError } from "../utils/index.js";
import { ChatMessage } from "../models/index.js";

const log = debug("gpp:tools:index");

export const tools: {
  [fileNameWithoutExt: string]: ToolFunction<object, any>;
} = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fs.readdirSync(__dirname).forEach((entry) => {
  const toolDir = path.join(__dirname, entry);
  if (!fs.statSync(toolDir).isDirectory()) return;

  fs.readdirSync(toolDir).forEach(async (entry) => {
    if (
      entry === "utils.ts" ||
      entry === "index.ts" ||
      !entry.endsWith(".ts")
    ) {
      return;
    }

    const toolPath = path.join(toolDir, entry);

    log(`load ${entry}`);
    const basename = path.basename(entry, ".ts");
    const { default: tool } = await import(toolPath);

    if (typeof tool !== "function") {
      throw new BaseError(`${entry} default export is not a function.`);
    }

    tools[basename] = async function toolWrapper(arg) {
      log(`${basename}(${JSON.stringify(arg, null, 2)})`);

      try {
        const result = await tool(arg);
        log(`${basename} =>`, result);

        await ChatMessage.create({
          // TODO: when the user calls a function: role='user', name='<username>'
          //       otherwise, the model thinks it called the function
          role: "function",
          content: JSON.stringify(result),
          name: basename,
        });

        return result;
      } catch (error) {
        await ChatMessage.create({
          // TODO: when the user calls a function: role='user', name='<username>'
          //       otherwise, the model thinks it called the function
          role: "function",
          content: error.toString(),
          name: basename,
        });

        throw error;
      }
    };
  });
});
