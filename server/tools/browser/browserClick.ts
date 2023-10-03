import type { ToolFunction } from "../../../types.js";
import { click } from "./utils.js";
import { ToolError } from "../../utils/index.js";

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
