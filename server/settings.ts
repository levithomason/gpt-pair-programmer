import fs from "fs";
import path from "path";
import debug from "debug";

import type { Settings } from "../types.js";
import { SETTINGS_PATH } from "./paths.js";
import { getSocketIO } from "./socket.io-server.js";
import { OPENAI_MODELS } from "../shared/config.js";

const log = debug("gpp:server:settings");

export const settings: Settings = {
  projectsDirectory: path.join(process.env.HOME, "src"),
  project: "",
  modelName: "gpt-3.5-turbo",
};

// TODO: model should be stored in settings object
export const activeModel = () => {
  return OPENAI_MODELS[settings.modelName];
};

// TODO: store projects in settings object?
export const listProjects = () => {
  return fs.readdirSync(settings.projectsDirectory).filter((name) => {
    return !name.startsWith(".");
  });
};

export const saveSettings = (partial: Settings) => {
  log("saveSettings", partial);

  Object.assign(settings, partial);
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

  const io = getSocketIO();
  io.emit("settingsUpdate", settings);
};

export const loadSettings = () => {
  if (fs.existsSync(SETTINGS_PATH)) {
    const string = fs.readFileSync(SETTINGS_PATH, "utf-8");
    const object = JSON.parse(string);

    Object.assign(settings, object);
  }
};

loadSettings();
