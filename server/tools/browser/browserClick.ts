import { click } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  selector: string;
};

type Return = string;

export const browserClick: ToolFunction<Args, Return> = async ({
  selector,
}) => {
  return await click(selector);
};

export default browserClick;
