import { readPage } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = string;

export const browserReadPage: ToolFunction<Args, Return> = async () => {
  try {
    return await readPage();
  } catch (err) {
    return err.toString();
  }
};

export default browserReadPage;
