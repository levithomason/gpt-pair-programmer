import { getDom } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserGetDom: ToolFunction<Args, Return> = async () => {
  return await getDom();
};

export default browserGetDom;
