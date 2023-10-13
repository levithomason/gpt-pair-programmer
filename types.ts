import type {
  ChatMessage,
  ChatMessageCreationAttributes,
} from "./server/models/index.js";

// TODO: Replace with `openapi-types`
// =============================================================================
// OpenAPI
// =============================================================================
export type OpenAPISpec = {
  openapi: string;
  info: {
    title: string;
    description?: string;
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
        schema?: OpenAPISchema;
      };
    };
  };
};
export type OpenAPISchema = {
  type: "object";
  required?: string[];
  properties: OpenAPISchemaProperties;
};

export type OpenAPISchemaProperties = {
  [name: string]: {
    type: string;
    description: string;
  };
};

// =============================================================================
// OpenAI
// =============================================================================
export type SupportedOpenAIModels =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0613"
  | "gpt-3.5-turbo-16k"
  | "gpt-3.5-turbo-16k-0613"
  | "gpt-4"
  | "gpt-4-0613"
  | "gpt-4-32k"
  | "gpt-4-32k-0613"
  | "text-embedding-ada-002";

export type OpenAIModel = {
  name: SupportedOpenAIModels;
  description: string;
  contextSize: number;
  inputCost: number;
  outputCost: number;
  supportsFunctionCalling: boolean;
  supportsFineTuning: boolean;
  supportsChat: boolean;
  supportsEmbeddings: boolean;
  outputDimensions?: number;
};

export type OpenAIFunction = {
  name: string;
  description?: string;
  parameters: OpenAPISchema;
};

// =============================================================================
// Tool
// =============================================================================
// TODO: Tools that return extra properties in their return object don't throw a type error
//       ToolDefinition should be stricter
export type ToolFunction<ArgObj, Return = void> = (
  args: ArgObj,
) => Promise<Return>;

export type ToolAttributes = {
  operationId: OpenAPIMethodDetails["operationId"];
  description: OpenAPIMethodDetails["description"];
  endpoint: OpenAPIPath;
  method: OpenAPIMethod;
  schema: OpenAPISchema;
};

// =============================================================================
// Socket.io
// =============================================================================
export interface ServerToClientEvents {
  /** Tell clients a new chat message has been created */
  chatMessageCreate: (data: { message: ChatMessageCreationAttributes }) => void;

  chatMessageStream: (data: {
    id: ChatMessage["id"];
    chunk: ChatMessageCreationAttributes["content"];
  }) => void;

  chatMessageStreamEnd: () => void;

  /** Tell clients we're online */
  serverHeartbeat: () => void;
}

export interface ClientToServerEvents {}

export interface InterServerEvents {
  //
}

export interface SocketData {
  //
}
