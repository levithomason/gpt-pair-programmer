import * as fs from "fs";

import type { ToolFunction } from "../../../types.js";
import { absPath } from "../../paths.js";
import { ToolError } from "../../utils/index.js";

type Args = {
  path: string;
};

type Return = {
  path: string;
  content: string;
};

const fileRead: ToolFunction<Args, Return> = async (file) => {
  const fileAbsPath = absPath(file.path);

  if (!fs.existsSync(fileAbsPath)) {
    throw new ToolError({
      tool: "fileRead",
      message: "File does not exist",
    });
  }

  try {
    return {
      path: file.path,
      content: fs.readFileSync(fileAbsPath, "utf8"),
    };
  } catch (error) {
    throw new ToolError({
      tool: "fileRead",
      message: "Failed to read file",
      error,
    });
  }
};

export default fileRead;
