import { type } from "./utils.js";
import { ToolError, ToolFunction } from "../../utils.js";

type Args = {
  selector: string;
  value: string;
};

type Return = string;

export const browserType: ToolFunction<Args, Return> = async ({
  selector,
  value,
}) => {
  try {
    return await type(selector, value);
  } catch (error) {
    throw new ToolError({
      tool: "browserType",
      message: "Failed to type",
      error,
    });
  }
};

export default browserType;
