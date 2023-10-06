import debug from "debug";

import type { OpenAIFunction } from "../../types.js";
import { forEachOpenAPIPath } from "../../shared/openapi.js";
import { openApiJson } from "./openapi-loader.js";

const log = debug("gpp:utils:openai-functions");

export const openAIFunctions: OpenAIFunction[] = [];

forEachOpenAPIPath(openApiJson, ({ operationId, description, schema }) => {
  const parameters = schema || { type: "object", properties: {} };

  log(operationId, parameters);

  openAIFunctions.push({ name: operationId, description, parameters });
});
