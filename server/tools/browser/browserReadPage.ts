import type { ToolFunction } from "../../types.js";
import { readPage } from "./utils.js";
import { ToolError } from "../../utils/index.js";

type Args = {
  url: string;
};

type Return = string;

export const browserReadPage: ToolFunction<Args, Return> = async () => {
  try {
    return await readPage();
  } catch (error) {
    throw new ToolError({
      tool: "browserReadPage",
      message: "Failed to read page",
      error,
    });
  }
};

export default browserReadPage;
