import { goTo } from "./utils";
import { ToolError, ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserGoTo: ToolFunction<Args, Return> = async ({ url }) => {
  try {
    return await goTo(url);
  } catch (error) {
    throw new ToolError({
      tool: "browserGoTo",
      message: "Failed to go to",
      error,
    });
  }
};

export default browserGoTo;
