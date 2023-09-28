import { run, ToolError, ToolFunction } from "../../utils";

type Args = {
  command: string;
  cwd: string;
};

type Return = {
  error: any;
  stdout: string;
  stderr: string;
};

const name = __filename;

const runShellCommand: ToolFunction<Args, Return> = async (args) => {
  if (!args.command) {
    throw new ToolError(name, "No command provided");
  }

  return await run(args.command, args.cwd);
};

export default runShellCommand;
