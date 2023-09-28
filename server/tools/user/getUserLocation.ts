import { getLocation } from "./utils";
import { ToolFunction } from "../../utils";

type Args = {
  url: string;
};

type Return = object;

export const getUserLocation: ToolFunction<Args, Return> = async () => {
  return getLocation();
};

export default getUserLocation;
