import fs from "fs";
import debug from "debug";
import { BaseError, ToolFunction } from "../utils";
import path from "path";

const log = debug("gpp:tools");

export const tools: {
  [fileNameWithoutExt: string]: ToolFunction<object, any>;
} = {};

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

    log(`Load: ${entry}`);
    const name = path.basename(entry, ".ts");
    const { default: tool } = await import(toolPath);

    if (typeof tool !== "function") {
      throw new BaseError(
        `Imported ${toolPath} but its default export is not a function`,
      );
    }

    tools[name] = async function toolWrapper(arg) {
      log(`${name}(${JSON.stringify(arg, null, 2)})`);

      const result = await tool(arg);
      log(`${name} =>`, result);

      return result;
    };
  });
});
