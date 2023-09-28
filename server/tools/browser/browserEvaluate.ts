import { ToolFunction } from "../../utils";
import { evaluate } from "./utils";

type Args = {
  string: string;
};

type Return = any;

export const browserEvaluate: ToolFunction<Args, Return> = async ({
  string,
}) => {
  return await evaluate(string);
};

export default browserEvaluate;
