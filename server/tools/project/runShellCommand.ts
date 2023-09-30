import { run, RunReturn, ToolError, ToolFunction } from "../../utils.js";

type Args = {
  command: string;
  cwd: string;
};

/**
 * @summary Execute a shell command
 * @description
 * Executes a background command in the project directory on the user's computer.
 * Do not execute commands that require user input, the user cannot see the terminal.
 * @method post
 * @endpoint /tools/project/exec
 */
const runShellCommand: ToolFunction<Args, RunReturn> = async (args) => {
  if (!args.command) {
    throw new ToolError({
      tool: "runShellCommand",
      message: "Command is required",
    });
  }

  return await run(args.command, args.cwd);
};

export default runShellCommand;
