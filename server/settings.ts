import fs from "fs";
import path from "path";
import debug from "debug";

import type { Settings, SettingsComputed } from "../types.js";
import { OPENAI_MODELS } from "../shared/config.js";
import { SETTINGS_PATH } from "./paths.js";
import { getSocketIO } from "./socket.io-server.js";
import { BaseError } from "./utils/index.js";

const log = debug("gpp:server:settings");

export const settings: Settings = {
  projectsRoot: path.join(process.env.HOME, "src"),
  projectName: "",
  modelName: "gpt-3.5-turbo",
};

//
// Computed Values
//
export const absProjectPath = (...paths: string[]) => {
  if (!settings.projectsRoot) return "";
  if (!settings.projectName) return "";

  return path.join(settings.projectsRoot, settings.projectName, ...paths);
};

/**
 * Returns a path relative to the project root.
 */
export const relProjectPath = (toPath: string) => {
  return path.relative(absProjectPath(), toPath);
};

export const activeModel = () => {
  if (!settings.modelName) return null;

  if (!OPENAI_MODELS[settings.modelName]) {
    const modelNames = Object.keys(OPENAI_MODELS).join(", ");

    throw new BaseError(
      `settings.modelName "${settings.modelName}" is not supported: ${modelNames}`,
    );
  }

  return OPENAI_MODELS[settings.modelName];
};

export const listProjects = () => {
  if (!settings.projectsRoot) return [];

  if (!fs.existsSync(settings.projectsRoot)) {
    throw new BaseError(
      `settings.projectsRoot does not exist: "${settings.projectsRoot}"`,
    );
  }

  if (!fs.statSync(settings.projectsRoot).isDirectory()) {
    throw new BaseError(
      `settings.projectsRoot is not a directory: "${settings.projectsRoot}"`,
    );
  }

  return fs.readdirSync(settings.projectsRoot).filter((name) => {
    return !name.startsWith(".");
  });
};

export const getComputedSettings = (): SettingsComputed => ({
  settings,
  projectPath: absProjectPath(),
  projects: listProjects(),
  models: Object.values(OPENAI_MODELS),
  model: activeModel(),
});

//
// Save/Load
//
export const saveSettings = (partial: Partial<Settings>): SettingsComputed => {
  log("saveSettings", partial);

  Object.assign(settings, partial);
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

  const computedSettings = getComputedSettings();

  const io = getSocketIO();
  io.emit("settingsComputed", computedSettings);

  return computedSettings;
};

export const loadSettings = () => {
  if (fs.existsSync(SETTINGS_PATH)) {
    const string = fs.readFileSync(SETTINGS_PATH, "utf-8");
    const object = JSON.parse(string);

    Object.assign(settings, object);
  }
};

loadSettings();
