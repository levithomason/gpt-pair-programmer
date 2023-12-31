import type { ToolFunction } from "../../../shared/types.js";
import { getInfo } from "./utils.js";

type Args = {
  url: string;
};

type Return = object;

export const getSystemInfo: ToolFunction<Args, Return> = async () => {
  return await getInfo();
};

export default getSystemInfo;
