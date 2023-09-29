import { readConsole } from "./utils";
import { ToolError, ToolFunction } from "../../utils";

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
