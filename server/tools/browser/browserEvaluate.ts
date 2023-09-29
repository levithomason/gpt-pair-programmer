import { ToolFunction } from "../../utils";
import { evaluate } from "./utils";

type Args = {
  code: string;
};

type Return = any;

export const browserEvaluate: ToolFunction<Args, Return> = async ({ code }) => {
  try {
    return await evaluate(code);
  } catch (err) {
    return err.toString();
  }
};

export default browserEvaluate;
