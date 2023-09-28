import { ToolFunction } from "../../utils";
import { evaluate } from "./utils";

type Args = {
  code: string;
};

type Return = any;

export const browserEvaluate: ToolFunction<Args, Return> = async ({
  code,
}) => {
  return await evaluate(code);
};

export default browserEvaluate;
