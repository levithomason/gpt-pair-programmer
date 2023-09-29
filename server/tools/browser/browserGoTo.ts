import { goTo } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserGoTo: ToolFunction<Args, Return> = async ({ url }) => {
  try {
    return await goTo(url);
  } catch (error) {
    return error.toString();
  }
};

export default browserGoTo;
