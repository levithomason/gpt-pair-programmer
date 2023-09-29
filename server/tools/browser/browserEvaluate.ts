import { ToolError, ToolFunction } from "../../utils";
import { evaluate } from "./utils";

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
