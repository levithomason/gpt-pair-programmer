import type { ToolFunction } from "../../types.js";
import { PROJECT_ROOT } from "../../../config.js";
import { generateTree } from "../../utils/index.js";

const getProjectTree: ToolFunction<never, string> = async () => {
  return generateTree(PROJECT_ROOT, 3);
};

export default getProjectTree;
