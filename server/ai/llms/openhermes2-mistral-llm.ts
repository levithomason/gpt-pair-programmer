import type { LLMMessage } from "../../../shared/types.js";
import { OLLAMA_LLM_DEFINITIONS, OllamaLLM } from "./ollama-llm.js";

export const openhermes2MistralLLM = new OllamaLLM(
  OLLAMA_LLM_DEFINITIONS["openhermes2-mistral:latest"],
  {
    promptFromMessages(messages: LLMMessage[]) {
      // https://ollama.ai/library/openhermes2-mistral:latest
      let prompt = ``;

      messages.forEach((m, i) => {
        prompt += `<|im_start|>${m.role}\n${m.content}<|im_end|>\n`;
      });
      prompt += `<|im_start|>assistant\n`;

      this.log("prompt:", prompt);

      return prompt;
    },
  },
);
