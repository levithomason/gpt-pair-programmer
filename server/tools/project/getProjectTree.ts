import { generateTree, ToolFunction } from "../../utils.js";
import { PROJECT_ROOT } from "../../../config.js";

const getProjectTree: ToolFunction<never, string> = async () => {
  return generateTree(PROJECT_ROOT, 3);
};

export default getProjectTree;
