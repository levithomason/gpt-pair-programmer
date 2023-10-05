import debug from "debug";

import type { OpenAPIMethod, OpenAPISchema, OpenAPISpec } from "../types.js";

const log = debug("gpp:shared");

export const forEachOpenAPIPath = (
  openApiJson: OpenAPISpec,
  callback: ({
    endpoint,
    method,
    schema,
  }: {
    operationId: string;
    description?: string;
    endpoint: string;
    method: OpenAPIMethod;
    schema: OpenAPISchema;
  }) => void,
) => {
  for (const [endpoint, methods] of Object.entries(openApiJson.paths)) {
    for (const [methodKey, details] of Object.entries(methods)) {
      const method = methodKey as OpenAPIMethod;
      const { operationId, description } = details;
      const schema = details.requestBody?.content?.["application/json"]?.schema;

      callback({ operationId, description, endpoint, method, schema });
    }
  }
};
