import fs from "fs";

import { absPath, ToolError, ToolFunction } from "../../utils";

type Args = {
  relPath: string;
  contents: string;
};

type Return = string;

const fileWrite: ToolFunction<Args, Return> = async (file) => {
  const absFilePath = absPath(file.relPath);

  try {
    fs.writeFileSync(absFilePath, file.contents, "utf8");
    return "File written successfully.";
  } catch (err) {
    throw new ToolError({
      tool: "fileWrite",
      message: `Failed to write file ${file.relPath}`,
      error: err,
    });
  }
};

export default fileWrite;
