import { goTo } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserGoTo: ToolFunction<Args, Return> = async ({ url }) => {
  return await goTo(url);
};

export default browserGoTo;
