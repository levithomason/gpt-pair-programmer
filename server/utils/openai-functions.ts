import type { OpenAIFunction } from "../../types.js";
import { forEachOpenAPIPath } from "../../shared/openapi.js";
import { openApiJson } from "./openapi-loader.js";

export const openAIFunctions: OpenAIFunction[] = [];

forEachOpenAPIPath(openApiJson, ({ operationId, description, schema }) => {
  openAIFunctions.push({
    name: operationId,
    description,
    parameters: schema,
  });
});
