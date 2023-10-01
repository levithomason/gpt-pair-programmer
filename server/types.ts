// TODO: Replace with `openapi-types`
// =============================================================================
// OpenAPI
// =============================================================================
export type OpenAPISpec = {
  openapi: string;
  info: {
    title: string;
    description?: string;
    termsOfService?: string;
    version: string;
  };
  servers?: { url: string }[];
  paths: {
    [path: OpenAPIPath]: {
      [method in OpenAPIMethod]: OpenAPIMethodDetails;
    };
  };
};

export type OpenAPIPath = string;
export type OpenAPIMethod = "get" | "post" | "put" | "delete" | "patch";
export type OpenAPIMethodDetails = {
  operationId: string;
  description?: string;
  requestBody?: {
    content?: {
      "application/json"?: {
        schema?: {
          type: "object";
          properties?: OpenAPISchemaProperties;
        };
      };
    };
  };
};

export type OpenAPISchemaProperties = {
  [name: string]: {
    type: string;
    description: string;
    required?: boolean;
  };
};

// =============================================================================
// OpenAI
// =============================================================================
export type OpenAIFunction = {
  name: string;
  description?: string;
  parameters: {
    type: "object";
    properties: Omit<OpenAPISchemaProperties, "required">;
    required?: string[];
  };
};

// =============================================================================
// Tool
// =============================================================================
// TODO: Tools that return extra properties in their return object don't throw a type error
//       ToolDefinition should be stricter
export type ToolFunction<ArgObj, Return = void> = (
  args: ArgObj,
) => Promise<Return>;
