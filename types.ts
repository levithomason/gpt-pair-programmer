import type { DataTypes as OriginalDataTypes } from "sequelize";
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
export type SupportedOpenAIModel =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-16k"
  | "gpt-4"
  | "gpt-4-32k";

export type SupportedOpenAIEmbeddingModel = "text-embedding-ada-002";

export type OpenAIModel = {
  name: SupportedOpenAIModel;
  description: string;
  contextSize: number;
  inputCost: number;
  outputCost: number;
  supportsFunctionCalling: boolean;
  supportsFineTuning: boolean;
  supportsChat: boolean;
};

export type OpenAIEmbeddingModel = {
  name: SupportedOpenAIEmbeddingModel;
  description: string;
  contextSize: number;
  inputCost: number;
  outputCost: number;
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

  /** Tell clients when settings update */
  settingsComputed: (data: SettingsComputed) => void;

  indexingProgress: (data: {
    filename: string;
    file: number;
    files: number;
    chunk: number;
  }) => void;
  indexingComplete: (data: { files: number; chunks: number }) => void;
}

export interface ClientToServerEvents {}

export interface InterServerEvents {
  //
}

export interface SocketData {
  //
}

// =============================================================================
// Settings
// =============================================================================
export type Settings = {
  projectsRoot: string;
  projectName: string;
  modelName: SupportedOpenAIModel;
};

export type SettingsComputed = {
  settings: Settings;
  projectPath: string;
  projects: string[];
  projectWorkingDirectory: string;
  model: OpenAIModel;
  models: OpenAIModel[];
};

// =============================================================================
// Sequelize
// =============================================================================

export type ExtendedDataTypes = typeof OriginalDataTypes & {
  VECTOR(dimensions: number): any;
};
