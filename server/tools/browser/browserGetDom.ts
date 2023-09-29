import { getDom } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserGetDom: ToolFunction<Args, Return> = async () => {
  try {
    return await getDom();
  } catch (err) {
    return err.toString();
  }
};

export default browserGetDom;
