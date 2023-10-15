import * as path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const ROOT = path.resolve(__dirname, "..");
export const APP_ROOT = path.resolve(ROOT, "app");
export const SERVER_ROOT = path.resolve(ROOT, "server");
export const PUBLIC_ROOT = path.resolve(ROOT, "public");
export const DIST_ROOT = path.resolve(ROOT, "dist");
export const TOOLS_ROOT = path.resolve(SERVER_ROOT, "tools");

export const BASE_SPEC_PATH = path.join(SERVER_ROOT, "openapi.base.yaml");
export const SETTINGS_PATH = path.join(SERVER_ROOT, "settings.json");

const resolveHomePath = (p: string) => {
  if (p.startsWith("~")) {
    p = path.join(process.env.HOME || "", p.slice(1));
  }
  return p;
};

/**
 * Returns a path relative to the project root.
 */
export const relProjectPath = (...p: string[]) => {
  return path.relative(ROOT, resolveHomePath(path.join(...p)));
};

/**
 * Returns an absolute path relative to the project root.
 */
export const absPath = (...p: string[]) => {
  return path.resolve(ROOT, resolveHomePath(path.join(...p)));
};
