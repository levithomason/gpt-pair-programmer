import type { ToolFunction } from "../../../types.js";
import { goTo } from "./utils.js";
import { ToolError } from "../../utils/index.js";

type Args = {
  url: string;
};

type Return = string;

export const browserGoTo: ToolFunction<Args, Return> = async ({ url }) => {
  try {
    return await goTo(url);
  } catch (error) {
    throw new ToolError({
      tool: "browserGoTo",
      message: "Failed to go to",
      error,
    });
  }
};

export default browserGoTo;
