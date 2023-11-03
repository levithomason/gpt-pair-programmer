import type { ToolFunction } from "../../../shared/types.js";
import { ToolError } from "../../utils/index.js";
import { evaluate } from "./utils.js";

type Args = {
  code: string;
};

type Return = any;

export const browserEvaluate: ToolFunction<Args, Return> = async ({ code }) => {
  try {
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
