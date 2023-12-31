import * as fs from "fs";

import type { ToolFunction } from "../../../shared/types.js";
import { ToolError } from "../../utils/index.js";
import { absProjectPath } from "../../settings.js";

type Args = {
  path: string;
};

type Return = {
  path: string;
  content: string;
};

const fileRead: ToolFunction<Args, Return> = async (file) => {
  const fileAbsPath = absProjectPath(file.path);

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
