import * as fs from "fs";
import * as path from "path";

import type { ToolFunction } from "../../../types.js";
import { ToolError } from "../../utils/index.js";
import { projectPath } from "../../settings.js";

type Return = {
  readme: string;
  packageJson: JSON;
};

const getProjectInfo: ToolFunction<void, Return> = async () => {
  const root = projectPath();

  // TODO: assemble more useful project info
  const readme = fs.readFileSync(path.join(root, "README.md"), "utf-8");
  const pkgString = fs.readFileSync(path.join(root, "package.json"), "utf-8");

  let packageJson: JSON;
  try {
    packageJson = JSON.parse(pkgString);
  } catch (error) {
    throw new ToolError({
      tool: "getProjectInfo",
      message: "Failed to parse package.json",
      error,
    });
  }

  return { readme, packageJson };
};

export default getProjectInfo;
