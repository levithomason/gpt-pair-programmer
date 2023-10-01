import { OpenAIFunction, OpenAPISpec } from "../types.js";

export const getOpenAIFunctions = (openAPISpec: OpenAPISpec) => {
  const openAIFunctions: OpenAIFunction[] = [];

  for (const [endpoint, methods] of Object.entries(openAPISpec.paths)) {
    for (const [method, details] of Object.entries(methods)) {
      const { operationId, description } = details;
      const requestBodyProperties =
        details.requestBody?.content?.["application/json"]?.schema
          ?.properties || {};

      //
      // Build OpenAI functions
      //
      const required: OpenAIFunction["parameters"]["required"] = [];
      const properties: OpenAIFunction["parameters"]["properties"] = {};

      Object.entries(requestBodyProperties).forEach(([name, property]) => {
        if (property.required) {
          delete property.required;
          required.push(name);
        }
        properties[name] = property;
      });

      const func: OpenAIFunction = {
        name: operationId,
        description,
        parameters: { type: "object", properties, required },
      };

      openAIFunctions.push(func);
    }
  }

  return openAIFunctions;
};
