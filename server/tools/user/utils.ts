import os from "os";

import axios from "axios";

import { run } from "../../utils.js";

export type Location = {
  ip: string; // "24.160.42.101";
  hostname: string; // "cpe-24-160-42-101.natnow.res.rr.com";
  city: string; // "Coeur d'Alene";
  region: string; // "Idaho";
  country: string; // "US";
  loc: string; // "47.7248,-116.7890";
  org: string; // "AS10838 Charter Communications Inc";
  postal: string; // "83815";
  timezone: string; // "America/Los_Angeles";
  readme: string; // "https://ipinfo.io/missingauth";
};

export type UserProfile = {
  fullName: string;
  email: string;
  username: string;
  linkedIn: string;
  github: string;
  time: string;
  timezone: string;
};

/**
 * Returns the current location of the user's system.
 */
export const getLocation = async (): Promise<Location> => {
  const { data } = await axios.get("https://ipinfo.io/json");
  return data;
};

/**
 * Returns information about the operating system and environment.
 */
export const getInfo = async (): Promise<UserProfile> => {
  return {
    fullName: await run("id -F").then(({ stdout }) => stdout.trim()),
    linkedIn: "https://linkedin.com/in/levithomason",
    github: "https://github.com/levithomason/",
    username: os.userInfo().username,
    email: await run("git config user.email").then(({ stdout }) =>
      stdout.trim(),
    ),
    time: new Date().toLocaleString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};
