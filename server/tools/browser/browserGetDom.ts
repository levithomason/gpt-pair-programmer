import { getDom } from "./utils";
import { ToolError, ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserGetDom: ToolFunction<Args, Return> = async () => {
  try {
    return await getDom();
  } catch (error) {
    throw new ToolError({
      tool: "browserGetDom",
      message: "Failed to get dom",
      error,
    });
  }
};

export default browserGetDom;
