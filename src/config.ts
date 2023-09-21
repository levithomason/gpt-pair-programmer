import path from "path";

export const GPT_4_MAX_TOKENS = 4000;
// response object has stdout, stderr, plus eslint results
// limit those as they can be very large
// TODO: this should be smarter based on the size of the complete response object
export const TERMINAL_STREAM_MAX_TOKENS = GPT_4_MAX_TOKENS / 10;

export const PROJECT_ROOT = path.resolve(__dirname, "..");
export const GPT_HOME = path.resolve(PROJECT_ROOT, "gpt-home");
export const GPT_PROJECTS = path.resolve(GPT_HOME, "projects");

