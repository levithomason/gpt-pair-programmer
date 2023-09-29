import { ToolError, ToolFunction } from "../../utils";
import { clearConsole, readConsole } from "./utils";

type Args = {
  url: string;
};

type Return = string;

export const browserClearConsole: ToolFunction<Args, Return> = async () => {
  try {
    clearConsole();
    return readConsole();
  } catch (error) {
    throw new ToolError({
      tool: "browserClearConsole",
      message: "Failed to clear console",
      error,
    });
  }
};

export default browserClearConsole;
