import { getInfo } from "./utils.js";
import { ToolFunction } from "../../utils.js";

type Args = {
  url: string;
};

type Return = object;

export const getUserProfile: ToolFunction<Args, Return> = async () => {
  return await getInfo();
};

export default getUserProfile;
