import { ToolFunction } from "../../utils";
import { clearConsole, readConsole } from "./utils";

type Args = {
  url: string;
};

type Return = string;

export const browserClearConsole: ToolFunction<Args, Return> = async () => {
  clearConsole();
  return readConsole();
};

export default browserClearConsole;
