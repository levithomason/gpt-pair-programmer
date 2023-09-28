import { goTo } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserGoTo: ToolFunction<Args, Return> = async ({ url }) => {
  let result = "";
  try {
    result = await goTo(url);
  } catch (error) {
    result = error.toString();
  }
  return result;
};

export default browserGoTo;
