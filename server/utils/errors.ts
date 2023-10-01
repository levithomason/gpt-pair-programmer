export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PairProgrammer";
  }
}

export type ToolErrorArgs = {
  tool: string;
  message: string;
  error?: Error;
};

export class ToolError extends BaseError {
  constructor({ tool, message, error }: ToolErrorArgs) {
    super(error ? `${message} - ${error}` : message);
    this.name = `ToolError(${tool})`;
    this.message = error ? `${message} - ${error}` : message;
  }
}
