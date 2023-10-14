import * as fs from "fs";
import * as path from "path";

import type { ToolFunction } from "../../../types.js";
import { PROJECT_ROOT } from "../../paths.js";
import { ToolError } from "../../utils/index.js";

type Return = {
  readme: string;
  packageJson: JSON;
};

const getProjectInfo: ToolFunction<never, Return> = async () => {
  // TODO: assemble more useful project info
  const readme = fs.readFileSync(path.join(PROJECT_ROOT, "README.md"), "utf-8");
  const pkgString = fs.readFileSync(
    path.join(PROJECT_ROOT, "package.json"),
    "utf-8",
  );

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
