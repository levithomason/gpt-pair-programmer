import fs from "fs";
import debug from "debug";
import { ToolFunction } from "../utils";
import path from "path";

const log = debug("gpp:tools");

export const tools: {
  // file name without extension (i.e. OpenAPI operationId)
  [fileName: string]: ToolFunction<any, any>;
} = {};

fs.readdirSync(__dirname).forEach((entry) => {
  const toolDir = path.join(__dirname, entry);
  if (!fs.statSync(toolDir).isDirectory()) return;

  fs.readdirSync(toolDir).forEach((entry) => {
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
    const tool = require(toolPath).default;

    tools[name] = (arg) => {
      log(`${name}(${JSON.stringify(arg, null, 2)})`);

      const result = tool(arg);

      result.then((data) => {
        log(`${name} =>`, data);
      });

      return result;
    };
  });
});
