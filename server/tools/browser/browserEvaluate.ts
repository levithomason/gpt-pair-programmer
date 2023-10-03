import type { ToolFunction } from "../../../types.js";
import { ToolError } from "../../utils/index.js";
import { evaluate } from "./utils.js";

type Args = {
  code: string;
};

type Return = any;

export const browserEvaluate: ToolFunction<Args, Return> = async ({ code }) => {
  try {
    // TODO: I don't think this works...
    return await evaluate(code);
  } catch (error) {
    throw new ToolError({
      tool: "browserEvaluate",
      message: "Failed to evaluate",
      error,
    });
  }
};

export default browserEvaluate;
