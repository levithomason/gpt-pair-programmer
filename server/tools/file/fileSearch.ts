import fs from "fs";
import { globSync } from "glob";

import { absPath, ToolFunction } from "../../utils";
import { run } from "../../utils";

type Args = {
  search: string;
};

type Return = string[];

const fileSearch: ToolFunction<Args, Return> = async ({ search }) => {
  const localGitIgnore = fs
    .readFileSync(absPath(".gitignore"), "utf8")
    .split("\n");

  const globalGitIgnore = await run("git config --get core.excludesfile").then(
    (res) => res.stdout.split("\n"),
  );

  // match kebab case, snake case, and camel case
  const pattern = `**/*(${search.replace(/-/g, ",")})?(.ts|.tsx|.js|.jsx)`;

  return globSync(pattern, {
    ignore: [
      "**/.git/**",
      "**/node_modules/**",
      ...localGitIgnore,
      ...globalGitIgnore,
    ],
    cwd: absPath("."),
    nocase: true,
    nodir: true,
  });
};

export default fileSearch;
