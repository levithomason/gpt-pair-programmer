import { getInfo } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = object;

export const getSystemInfo: ToolFunction<Args, Return> = async () => {
  return await getInfo();
};

export default getSystemInfo;
