import type { ToolFunction } from "../../../types.js";
import { getInfo } from "./utils.js";

type Args = {
  url: string;
};

type Return = object;

export const getUserProfile: ToolFunction<Args, Return> = async () => {
  return await getInfo();
};

export default getUserProfile;
