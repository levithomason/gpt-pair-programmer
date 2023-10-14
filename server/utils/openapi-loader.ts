import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";
import debug from "debug";

import type { OpenAPISpec } from "../../types.js";
import { BASE_SPEC_PATH, relProjectPath, TOOLS_ROOT } from "../paths.js";
import { BaseError } from "../utils/index.js";

const log = debug("gpp:server:openapi-loader");

// ============================================================================
// Aggregate OpenAPI Tool Specs
// ============================================================================
const baseSpec = yaml.load(
  fs.readFileSync(BASE_SPEC_PATH, "utf8"),
) as OpenAPISpec;

//
// Load tool specs
//
fs.readdirSync(TOOLS_ROOT).forEach((tool) => {
  const toolDir = path.join(TOOLS_ROOT, tool);
  if (!fs.statSync(toolDir).isDirectory()) {
    return;
  }

  const specPath = path.join(toolDir, "openapi.yaml");
  if (!fs.existsSync(specPath)) {
    throw new BaseError(
      `Tool "${relProjectPath(toolDir)}" is missing an openapi.yaml spec.`,
    );
  }

  log("load", relProjectPath(specPath));
  const specYaml = fs.readFileSync(specPath, "utf8");
  const specJson = yaml.load(specYaml) as OpenAPISpec;

  baseSpec.paths = { ...baseSpec.paths, ...specJson.paths };
});

//
// Export
//
export const openApiYaml = [
  "# WARNING: This file is generated. Do not edit it directly.",
  "# To make changes, edit the root `openapi.base.yaml` or `tools/*/openapi.yaml` files.",
  yaml.dump(baseSpec),
].join("\n");

export const openApiJson = yaml.load(openApiYaml) as OpenAPISpec;
