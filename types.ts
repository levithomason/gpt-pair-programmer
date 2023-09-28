import { ChatCompletionCreateParamsStreaming } from "openai/src/resources/chat/completions";

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
