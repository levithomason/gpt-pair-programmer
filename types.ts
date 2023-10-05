import type { ChatCompletionCreateParamsStreaming } from "openai/src/resources/chat/completions.js";
import type { ChatMessageType } from "./app/components/chat/types";

export type OpenAIModel = {
  name: Exclude<
    ChatCompletionCreateParamsStreaming["model"],
    "gpt-4-0314" | "gpt-4-32k-0314" | "gpt-3.5-turbo-0301"
  >;
  description: string;
  contextMaxTokens: number;
  inputCost: number;
  outputCost: number;
  supportsFunctionCalling: boolean;
  supportsFineTuning: boolean;
  supportsChat: boolean;
  supportsEmbeddings: boolean;
  outputDimensions?: number;
};

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

// =============================================================================
// Socket.io
// =============================================================================
export interface ServerToClientEvents {
  newChatMessage: (data: { message: ChatMessageType }) => void;
}

export interface ClientToServerEvents {
  /** Get the current status of the socket.io server */
  status: () => void;
}

export interface InterServerEvents {
  //
}

export interface SocketData {
  name: string;
  age: number;
}
