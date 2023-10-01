import type { ToolFunction } from "../../types.js";
import { readConsole } from "./utils.js";
import { ToolError } from "../../utils/index.js";

type Args = {
  url: string;
};

type Return = string;

export const browserGetConsole: ToolFunction<Args, Return> = async () => {
  try {
    return readConsole();
  } catch (error) {
    throw new ToolError({
      tool: "browserGetConsole",
      message: "Failed to get console",
      error,
    });
  }
};

export default browserGetConsole;
