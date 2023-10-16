import type { ToolFunction } from "../../../types.js";
import { generateTree } from "../../utils/index.js";
import { absProjectPath } from "../../settings.js";

const getProjectTree: ToolFunction<void, string> = async () => {
  return generateTree(absProjectPath(), { maxDepth: 3 });
};

export default getProjectTree;
