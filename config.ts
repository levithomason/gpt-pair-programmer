import path from "path";
import { OpenAIModel } from "./types";

export const PROJECT_ROOT = __dirname;
export const APP_ROOT = path.resolve(PROJECT_ROOT, "app");
export const SERVER_ROOT = path.resolve(PROJECT_ROOT, "server");
export const PUBLIC_ROOT = path.resolve(PROJECT_ROOT, "public");
export const DIST_ROOT = path.resolve(PROJECT_ROOT, "dist");
export const TOOLS_ROOT = path.resolve(SERVER_ROOT, "tools");

export const OPENAI_MODELS: Record<OpenAIModel['name'], OpenAIModel> = {
  "gpt-3.5-turbo": {
    name: "gpt-3.5-turbo",
    description:
      "Most capable GPT-3.5 model and optimized for chat at 1/10th the cost of text-davinci-003.",
    contextMaxTokens: 4097,
    inputCost: 0.0015,
    outputCost: 0.002,
    supportsFunctionCalling: false,
    supportsFineTuning: true,
    supportsChat: true,
    supportsEmbeddings: false,
  },
  "gpt-3.5-turbo-0613": {
    name: "gpt-3.5-turbo-0613",
    description:
      "Snapshot of gpt-3.5-turbo from June 13th 2023 with function calling data.",
    contextMaxTokens: 4097,
    inputCost: 0.0015,
    outputCost: 0.002,
    supportsFunctionCalling: true,
    supportsFineTuning: true,
    supportsChat: true,
    supportsEmbeddings: false,
  },
  "gpt-3.5-turbo-16k": {
    name: "gpt-3.5-turbo-16k",
    description:
      "Same capabilities as the standard gpt-3.5-turbo model but with 4 times the context.",
    contextMaxTokens: 16385,
    inputCost: 0.003,
    outputCost: 0.004,
    supportsFunctionCalling: false,
    supportsFineTuning: false,
    supportsChat: true,
    supportsEmbeddings: false,
  },
  "gpt-3.5-turbo-16k-0613": {
    name: "gpt-3.5-turbo-16k-0613",
    description: "Snapshot of gpt-3.5-turbo-16k from June 13th 2023.",
    contextMaxTokens: 16385,
    inputCost: 0.003,
    outputCost: 0.004,
    supportsFunctionCalling: false,
    supportsFineTuning: false,
    supportsChat: true,
    supportsEmbeddings: false,
  },
  "gpt-4": {
    name: "gpt-4",
    description:
      "More capable than any GPT-3.5 model, able to do more complex tasks, and optimized for chat.",
    contextMaxTokens: 8192,
    inputCost: 0.03,
    outputCost: 0.06,
    supportsFunctionCalling: false,
    supportsFineTuning: false,
    supportsChat: true,
    supportsEmbeddings: false,
  },
  "gpt-4-0613": {
    name: "gpt-4-0613",
    description:
      "Same improvements as gpt-4 but with function calling capability.",
    contextMaxTokens: 8192,
    inputCost: 0.03,
    outputCost: 0.06,
    supportsFunctionCalling: true,
    supportsFineTuning: false,
    supportsChat: true,
    supportsEmbeddings: false,
  },
  "gpt-4-32k": {
    name: "gpt-4-32k",
    description:
      "Same capabilities as the standard gpt-4 mode but with 4x the context length.",
    contextMaxTokens: 32768,
    inputCost: 0.06,
    outputCost: 0.12,
    supportsFunctionCalling: false,
    supportsFineTuning: false,
    supportsChat: true,
    supportsEmbeddings: false,
  },
  "gpt-4-32k-0613": {
    name: "gpt-4-32k-0613",
    description:
      "Same improvements as gpt-4-32k but with function calling capability.",
    contextMaxTokens: 32768,
    inputCost: 0.06,
    outputCost: 0.12,
    supportsFunctionCalling: true,
    supportsFineTuning: false,
    supportsChat: true,
    supportsEmbeddings: false,
  },
  "text-embedding-ada-002": {
    name: "text-embedding-ada-002",
    description:
      "Second generation embedding model designed to replace the previous 16 first-generation embedding models at a fraction of the cost.",
    contextMaxTokens: 8191,
    inputCost: 0.0001,
    outputCost: 0,
    outputDimensions: 1536,
    supportsFunctionCalling: false,
    supportsFineTuning: false,
    supportsChat: false,
    supportsEmbeddings: true,
  },
};
