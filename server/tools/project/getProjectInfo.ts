import * as fs from "fs";

import type { ToolFunction } from "../../../types.js";
import { ToolError } from "../../utils/index.js";
import { absProjectPath } from "../../settings.js";

type Return = {
  readme: string;
  packageJson: JSON;
};

const getProjectInfo: ToolFunction<void, Return> = async () => {
  // TODO: assemble more useful project info
  const readme = fs.readFileSync(absProjectPath("README.md"), "utf-8");
  const pkgString = fs.readFileSync(absProjectPath("package.json"), "utf-8");

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
