import type { OpenAILLM } from "./openai-llm.js";
import type { OllamaLLM } from "./ollama-llm.js";
import type {
  SupportedLLMDefinition,
  SupportedLLMName,
} from "../../../shared/types.js";

import { gpt35TurboLLM } from "./gpt-35-turbo-llm.js";
import { gpt35Turbo16kLLM } from "./gpt-35-turbo-16k-llm.js";
import { gpt4LLM } from "./gpt-4-llm.js";
import { gpt432kLLM } from "./gpt-4-32k-llm.js";
import { mistralInstructLLM } from "./mistral-instruct-llm.js";
import { openhermes2MistralLLM } from "./openhermes2-mistral-llm.js";

export const llms = [
  gpt35TurboLLM,
  gpt35Turbo16kLLM,
  gpt4LLM,
  gpt432kLLM,
  mistralInstructLLM,
  openhermes2MistralLLM,
];

export const llmDefinitions: SupportedLLMDefinition[] = llms.map(
  (llm) => llm.definition,
);

export const llmNames: SupportedLLMName[] = llmDefinitions.map(
  (llm) => llm.name,
);

export const getLLMDefinition = (llmName: SupportedLLMName) => {
  return llmDefinitions.find((llm) => llm.name === llmName);
};

export const isLLMImplemented = (modelName: SupportedLLMName) => {
  return llmNames.includes(modelName);
};

export const getLLM = (llmName: SupportedLLMName): OpenAILLM | OllamaLLM => {
  if (!isLLMImplemented(llmName)) {
    throw new Error(`LLM "${llmName}" is not implemented yet.`);
  }

  return llms.find((llm) => llm.name === llmName);
};
