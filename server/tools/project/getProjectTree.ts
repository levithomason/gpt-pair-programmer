import { generateTree, ToolFunction } from "../../utils";
import { PROJECT_ROOT } from "../../../config";

const getProjectTree: ToolFunction<never, string> = async () => {
  return generateTree(PROJECT_ROOT, 3);
};

export default getProjectTree;
