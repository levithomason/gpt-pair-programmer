import type {
  OpenAIEmbeddingModel,
  OpenAIModel,
  SupportedOpenAIEmbeddingModel,
  SupportedOpenAIModel,
} from "../types.js";

export const OPENAI_MODELS: Record<SupportedOpenAIModel, OpenAIModel> = {
  "gpt-3.5-turbo": {
    name: "gpt-3.5-turbo",
    description:
      "Most capable GPT-3.5 model and optimized for chat at 1/10th the cost of text-davinci-003.",
    contextSize: 4097,
    inputCost: 0.0015,
    outputCost: 0.002,
    supportsFunctionCalling: false,
    supportsFineTuning: true,
  },
  "gpt-3.5-turbo-16k": {
    name: "gpt-3.5-turbo-16k",
    description:
      "Same capabilities as the standard gpt-3.5-turbo model but with 4 times the context.",
    contextSize: 16385,
    inputCost: 0.003,
    outputCost: 0.004,
    supportsFunctionCalling: true,
    supportsFineTuning: false,
  },
  "gpt-4": {
    name: "gpt-4",
    description:
      "More capable than any GPT-3.5 model, able to do more complex tasks, and optimized for chat.",
    contextSize: 8192,
    inputCost: 0.03,
    outputCost: 0.06,
    supportsFunctionCalling: false,
    supportsFineTuning: false,
  },
  "gpt-4-32k": {
    name: "gpt-4-32k",
    description:
      "Same capabilities as the standard gpt-4 mode but with 4x the context length.",
    contextSize: 32768,
    inputCost: 0.06,
    outputCost: 0.12,
    supportsFunctionCalling: false,
    supportsFineTuning: false,
    supportsChat: true,
  },
};

export const OPENAI_EMBEDDING_MODELS: Record<
  SupportedOpenAIEmbeddingModel,
  OpenAIEmbeddingModel
> = {
  "text-embedding-ada-002": {
    name: "text-embedding-ada-002",
    description:
      "Second generation embedding model designed to replace the previous 16 first-generation embedding models at a fraction of the cost.",
    contextSize: 8191,
    inputCost: 0.0001,
    outputCost: 0,
    outputDimensions: 1536,
  },
};
