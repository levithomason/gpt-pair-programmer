import { getLocation } from "./utils.js";
import { ToolFunction } from "../../utils.js";

type Args = {
  url: string;
};

type Return = object;

export const getUserLocation: ToolFunction<Args, Return> = async () => {
  return getLocation();
};

export default getUserLocation;
