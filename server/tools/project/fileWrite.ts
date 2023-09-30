import * as fs from "fs";

import { absPath, ToolError, ToolFunction } from "../../utils.js";

type Args = {
  path: string;
  contents: string;
};

type Return = string;

const fileWrite: ToolFunction<Args, Return> = async (file) => {
  const absFilePath = absPath(file.path);
  const dir = absFilePath.split("/").slice(0, -1).join("/");

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    throw new ToolError({
      tool: "fileWrite",
      message: `Failed to create directory ${dir}`,
      error,
    });
  }

  try {
    fs.writeFileSync(absFilePath, file.contents, "utf8");
    return "File written successfully.";
  } catch (err) {
    throw new ToolError({
      tool: "fileWrite",
      message: `Failed to write file ${file.path}`,
      error: err,
    });
  }
};

export default fileWrite;
