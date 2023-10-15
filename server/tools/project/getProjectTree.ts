import type { ToolFunction } from "../../../types.js";
import { generateTree } from "../../utils/index.js";
import { projectPath } from "../../settings.js";

const getProjectTree: ToolFunction<void, string> = async () => {
  return generateTree(projectPath(), { maxDepth: 3 });
};

export default getProjectTree;
