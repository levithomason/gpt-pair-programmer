import { readConsole } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserGetConsole: ToolFunction<Args, Return> = async () => {
  try {
    return readConsole();
  } catch (err) {
    return err.toString();
  }
};

export default browserGetConsole;
