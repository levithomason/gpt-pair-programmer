import { readPage } from "./utils.js";
import { ToolError, ToolFunction } from "../../utils.js";

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
