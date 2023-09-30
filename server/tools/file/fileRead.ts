import * as fs from "fs";

import { absPath, ToolError, ToolFunction } from "../../utils.js";

type Args = {
  relPath: string;
};

type Return = string;

const fileRead: ToolFunction<Args, Return> = async (file) => {
  const fileAbsPath = absPath(file.relPath);

  if (!fs.existsSync(fileAbsPath)) {
    throw new ToolError({
      tool: "fileRead",
      message: "File does not exist",
    });
  }

  try {
    return fs.readFileSync(fileAbsPath, "utf8");
  } catch (error) {
    throw new ToolError({
      tool: "fileRead",
      message: "Failed to read file",
      error,
    });
  }
};

export default fileRead;
