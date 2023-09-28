import fs from "fs";
import path from "path";

import { ToolFunction } from "../../utils";
import { PROJECT_ROOT } from "../../../config";

type Return = {
  readme: string;
  packageJson: JSON;
};

const getProjectInfo: ToolFunction<never, Return> = async () => {
  // TODO: assemble useful project info
  return {
    readme: fs.readFileSync(path.join(PROJECT_ROOT, "README.md"), "utf-8"),
    packageJson: require(path.join(PROJECT_ROOT, "package.json")),
  };
};

export default getProjectInfo;
