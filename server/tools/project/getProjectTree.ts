import type { ToolFunction } from "../../../types.js";
import { generateTree } from "../../utils/index.js";
import { projectPath } from "../../settings.js";

const getProjectTree: ToolFunction<never, string> = async () => {
  return generateTree(projectPath(), 3);
};

export default getProjectTree;
