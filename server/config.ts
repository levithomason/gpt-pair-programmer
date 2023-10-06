import * as path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const PROJECT_ROOT = path.resolve(__dirname, "..");
export const APP_ROOT = path.resolve(PROJECT_ROOT, "app");
export const SERVER_ROOT = path.resolve(PROJECT_ROOT, "server");
export const PUBLIC_ROOT = path.resolve(PROJECT_ROOT, "public");
export const DIST_ROOT = path.resolve(PROJECT_ROOT, "dist");
export const TOOLS_ROOT = path.resolve(SERVER_ROOT, "tools");

export const relPath = (p: string) => {
  if (p.startsWith("~")) {
    p = path.join(process.env.HOME || "", p.slice(1));
  }
  return path.relative(PROJECT_ROOT, p);
};

export const absPath = (p: string) => {
  if (p.startsWith("~")) {
    p = path.join(process.env.HOME || "", p.slice(1));
  }
  return path.resolve(PROJECT_ROOT, p);
};

export const BASE_SPEC_PATH = path.join(SERVER_ROOT, "openapi.base.yaml");
