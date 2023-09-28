import { readPage } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserReadPage: ToolFunction<Args, Return> = async () => {
  return await readPage();
};

export default browserReadPage;
