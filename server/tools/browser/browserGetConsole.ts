import { readConsole } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserGetConsole: ToolFunction<Args, Return> = async () => {
  return readConsole();
};

export default browserGetConsole;
