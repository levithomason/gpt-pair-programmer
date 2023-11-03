import type { ToolFunction } from "../../../shared/types.js";
import { ToolError } from "../../utils/index.js";
import { promptProjectOverview } from "../../ai/prompts.js";

type Return = string;

const getProjectInfo: ToolFunction<void, Return> = async () => {
  let info: string;
  try {
    info = await promptProjectOverview();
  } catch (error) {
    throw new ToolError({
      tool: "getProjectInfo",
      message: "Failed to get system default prompt",
      error,
    });
  }

  return info;
};

export default getProjectInfo;
