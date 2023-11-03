import type { OpenAPIMethod, OpenAPISpec, ToolAttributes } from "./types.js";

export const forEachOpenAPIPath = (
  openApiJson: OpenAPISpec,
  callback: (tool: ToolAttributes) => void,
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
