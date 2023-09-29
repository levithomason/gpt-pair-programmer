import { readPage } from "./utils";
import { ToolError, ToolFunction } from "../../utils";

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
