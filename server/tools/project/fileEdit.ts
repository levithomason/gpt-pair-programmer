import * as fs from "fs";

import type { ToolFunction } from "../../../types.js";
import { ToolError } from "../../utils/index.js";
import { absPath } from "../../../config.js";

type Edit = {
  start: string;
  end: string;
  content: string;
};

type Args = {
  path: string;
  edits: Edit[];
};

type Return = string;

const fileEdit: ToolFunction<Args, Return> = async (args) => {
  const fileAbsPath = absPath(args.path);

  if (!fs.existsSync(fileAbsPath)) {
    throw new ToolError({
      tool: "fileEdit",
      message: "File does not exist",
    });
  }

  let fileContents = "";
  try {
    fileContents = fs.readFileSync(fileAbsPath, "utf8");
  } catch (error) {
    throw new ToolError({
      tool: "fileEdit",
      message: "Failed to read file",
      error,
    });
  }

  // apply edits
  args.edits.forEach(({ start, end, content }, i) => {
    const indexStart = fileContents.indexOf(start);
    if (indexStart === -1) {
      throw new ToolError({
        tool: "fileEdit",
        message: `File contents do not contain edit[${i}].start.`,
      });
    }

    const indexEnd = fileContents.indexOf(end, indexStart);
    if (indexEnd === -1) {
      throw new ToolError({
        tool: "fileEdit",
        message: `File contents do not contain edit[${i}].end.`,
      });
    }

    fileContents =
      fileContents.slice(0, indexStart) +
      content +
      fileContents.slice(indexEnd + end.length);
  });

  try {
    fs.writeFileSync(absPath(args.path), fileContents, "utf8");
    return fileContents;
  } catch (error) {
    throw new ToolError({
      tool: "fileEdit",
      message: `File contents edited successfully but failed to write to disk: ${args.path}`,
      error,
    });
  }
};

export default fileEdit;
