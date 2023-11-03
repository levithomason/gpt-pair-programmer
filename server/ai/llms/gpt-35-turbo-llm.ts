import { OpenAILLM, OPENAI_LLM_DEFINITIONS } from "./openai-llm.js";

export const gpt35TurboLLM = new OpenAILLM(
  OPENAI_LLM_DEFINITIONS["gpt-3.5-turbo"],
);
