import * as fs from "fs";

import type { ToolFunction } from "../../../types.js";
import { absProjectPath } from "../../paths.js";
import { ToolError } from "../../utils/index.js";

type Args = {
  path: string;
};

type Return = string;

const fileDelete: ToolFunction<Args, Return> = async (file) => {
  const fileAbsPath = absProjectPath(file.path);

  try {
    fs.unlinkSync(fileAbsPath);
    return "File deleted successfully.";
  } catch (error) {
    throw new ToolError({
      tool: "fileDelete",
      message: "Failed to delete file",
      error,
    });
  }
};

export default fileDelete;
