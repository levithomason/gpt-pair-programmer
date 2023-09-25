type OpenAPIProperties = {
  [name: string]: {
    type: string;
    description?: string;
    required?: boolean;
  };
};

type OpenAPISchema = {
  type: "object";
  properties?: OpenAPIProperties;
};

export type OpenAPISpec = {
  openapi: string;
  info: {
    title: string;
    description?: string;
    termsOfService?: string;
    version: string;
  };
  servers?: {
    url: string;
  }[];
  paths: {
    [path: string]: {
      [method: string]: {
        operationId: string;
        description?: string;
        requestBody?: {
          content?: {
            "application/json"?: {
              schema?: OpenAPISchema;
            };
          };
        };
      };
    };
  };
};

export type OpenAIFunction = {
  name: string;
  description?: string;
  parameters: {
    type: "object";
    properties: OpenAPIProperties;
    required?: string[];
  };
};
