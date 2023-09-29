import { type } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  selector: string;
  value: string;
};

type Return = string;

export const browserType: ToolFunction<Args, Return> = async ({
  selector,
  value,
}) => {
  try {
    return await type(selector, value);
  } catch (err) {
    return err.toString();
  }
};

export default browserType;
