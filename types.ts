import type { DataTypes as OriginalDataTypes } from "sequelize";
import type { ChatCompletionMessageParam } from "openai/resources/chat/index.js";

import type {
  ChatMessage,
  ChatMessageCreationAttributes,
} from "./server/models/index.js";

// =============================================================================
// Chat Messages
// =============================================================================
export type ChatMessagesByID = {
  [id in ChatMessageCreationAttributes["id"]]: ChatMessageCreationAttributes;
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
// Ollama
// =============================================================================
export type OllamaModel =
  | "codellama:7b"
  | "llama2:latest"
  | "mistral:7b-instruct"
  | "mistral:latest"
  | string;

export type OllamaTag = {
  name: OllamaModel;
  modified_at: string;
  size: number;
};

export type OllamaTagsResponse = {
  models: Array<OllamaTag>;
};

export type OllamaEmbeddingParameters = {
  /** Name of model to generate embeddings from */
  model: OllamaModel;
  /** Text to generate embeddings for */
  prompt: string;
};
export type OllamaGenerateParameters = {
  /** (required) the model name */
  model: OllamaModel;
  /** The prompt to generate a response for */
  prompt: string;
  /** Advanced: Additional model parameters listed in the documentation for the Modelfile such as temperature */
  options?: {
    /**
     * Enable Mirostat sampling for controlling perplexity.
     * (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)	int	mirostat 0
     */
    mirostat?: 0 | 1 | 2;
    /**
     * Influences how quickly the algorithm responds to feedback from the generated text.
     * A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive.
     * (Default: 0.1)	float	mirostat_eta 0.1
     */
    mirostat_eta?: number;
    /**
     * Controls the balance between coherence and diversity of the output.
     * A lower value will result in more focused and coherent text.
     * (Default: 5.0)	float	mirostat_tau 5.0
     */
    mirostat_tau?: number;
    /**
     * Sets the size of the context window used to generate the next token.
     * (Default: 2048)	int	num_ctx 4096
     */
    num_ctx?: number;
    /**
     * The number of GQA groups in the transformer layer.
     * Required for some models, for example it is 8 for llama2:70b	int	num_gqa 1
     */
    num_gqa?: number;
    /**
     * The number of layers to send to the GPU(s).
     * On macOS, it defaults to 1 to enable metal support, 0 to disable.	int	num_gpu 50
     */
    num_gpu?: number;
    /**
     * Sets the number of threads to use during computation.
     * By default, Ollama will detect this for optimal performance.
     * It is recommended to set this value to the number of physical CPU cores your system has (as opposed to the logical number of cores).	int	num_thread 8
     */
    num_thread?: number;
    /**
     * Sets how far back for the model to look back to prevent repetition.
     * (Default: 64, 0 = disabled, -1 = num_ctx)	int	repeat_last_n 64
     */
    repeat_last_n?: number;
    /**
     * Sets how strongly to penalize repetitions.
     * A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient.
     * (Default: 1.1)	float	repeat_penalty 1.1
     */
    repeat_penalty?: number;
    /**
     * The temperature of the model.
     * Increasing the temperature will make the model answer more creatively.
     * (Default: 0.8)	float	temperature 0.7
     */
    temperature?: number;
    /**
     * Sets the random number seed to use for generation.
     * Setting this to a specific number will make the model generate the same text for the same prompt.
     * (Default: 0)	int	seed 42
     */
    seed?: number;
    /**
     * Sets the stop sequences to use.	string	stop "AI assistant:"
     */
    stop?: number;
    /**
     * Tail free sampling is used to reduce the impact of less probable tokens from the output.
     * A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting.
     * (default: 1)	float	tfs_z 1
     */
    tfs_z?: number;
    /**
     * Maximum number of tokens to predict when generating text.
     * (Default: 128, -1 = infinite generation, -2 = fill context)	int	num_predict 42
     */
    num_predict?: number;
    /**
     * Reduces the probability of generating nonsense.
     * A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative.
     * (Default: 40)	int	top_k 40
     */
    top_k?: number;
    /**
     * Works together with top-k.
     * A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text.
     * (Default: 0.9)	float	top_p 0.9
     */
    top_p?: number;
  };
  /** Advanced: System prompt to (overrides what is defined in the Modelfile) */
  system?: string;
  /** Advanced: The full prompt or prompt template (overrides what is defined in the Modelfile) */
  template?: string;
  /** Advanced: The context parameter returned from a previous request to /generate, this can be used to keep a short conversational memory */
  context?: string[];
  /** Advanced: If false the response will be returned as a single response object, rather than a stream of objects */
  stream?: string;
};

export type OllamaResponseStreamingInProgress = {
  /** Model name, example `llama2:7b` */
  model: OllamaModel;
  /** UTC timestamp of when the request was created */
  created_at: string;
  /** The chunk of the response */
  response: string;
  /** Whether the response is complete */
  done: boolean;
};

export type OllamaResponseStreamingDone = OllamaResponseStreamingInProgress & {
  /** time spent generating the response */
  total_duration: number;
  /** time spent in nanoseconds loading the model */
  load_duration: number;
  /** number of samples generated */
  sample_count: number;
  /** time spent generating samples */
  sample_duration: number;
  /** number of tokens in the prompt */
  prompt_eval_count: number;
  /** time spent in nanoseconds evaluating the prompt */
  prompt_eval_duration: number;
  /** number of tokens the response */
  eval_count: number;
  /** time in nanoseconds spent generating the response */
  eval_duration: number;
  /** an encoding of the conversation used in this response, this can be sent in the next request to keep a conversational memory */
  context: number[];
  /** empty if the response was streamed, if not streamed, this will contain the full response */
  response: string;
};

export type OllamaResponseStreaming =
  | OllamaResponseStreamingDone
  | OllamaResponseStreamingInProgress;

export type OllamaCallback = (data: OllamaResponseStreaming) => void;

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

  projectChanged: (data: { project: string }) => void;

  indexingProgress: (data: {
    filename: string;
    file: number;
    files: number;
    chunk: number;
  }) => void;
  indexingComplete: (data: { files: number; chunks: number }) => void;

  contextWindowUpdate: (data: {
    messages: ChatCompletionMessageParam[];
    tokens: number;
  }) => void;
}

export type DataForEvent<E extends keyof ServerToClientEvents> =
  ServerToClientEvents[E] extends (data: infer T) => void ? T : never;

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
