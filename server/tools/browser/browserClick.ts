import { click } from "./utils.js";
import { ToolError, ToolFunction } from "../../utils.js";

type Args = {
  selector: string;
};

type Return = string;

export const browserClick: ToolFunction<Args, Return> = async ({
  selector,
}) => {
  try {
    return await click(selector);
  } catch (error) {
    throw new ToolError({
      tool: "browserClick",
      message: "Failed to click",
      error,
    });
  }
};

export default browserClick;
