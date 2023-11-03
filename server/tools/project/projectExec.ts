import type { ToolFunction } from "../../../shared/types.js";
import type { RunReturn } from "../../utils/index.js";
import { run, ToolError } from "../../utils/index.js";

type Args = {
  command: string;
  cwd: string;
};

// TODO: consider using a docblock to define the OpenAPI spec
/**
 * @summary Execute a shell command
 * @description
 * Executes a background command in the project directory on the user's computer.
 * Do not execute commands that require user input, the user cannot see the terminal.
 * @method post
 * @endpoint /tools/project/exec
 */
const projectExec: ToolFunction<Args, RunReturn> = async (args) => {
  if (!args.command) {
    throw new ToolError({
      tool: "projectExec",
      message: "Command is required",
    });
  }

  return await run(args.command, args.cwd);
};

export default projectExec;
