import fs from "fs";

import { absPath, ToolError, ToolFunction } from "../../utils";

type Args = {
  relPath: string;
};

type Return = string;

const fileRead: ToolFunction<Args, Return> = async (file) => {
  const fileAbsPath = absPath(file.relPath);

  if (!fs.existsSync(fileAbsPath)) {
    throw new ToolError("fileRead", `File does not exist: ${fileAbsPath}`);
  }

  try {
    return fs.readFileSync(fileAbsPath, "utf8");
  } catch (err) {
    return new ToolError(
      "fileRead",
      `Error reading file: ${err.message}`,
    ).toString();
  }
};

export default fileRead;
