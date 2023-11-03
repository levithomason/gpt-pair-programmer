import type { LLMMessage } from "../../../shared/types.js";
import { OLLAMA_LLM_DEFINITIONS, OllamaLLM } from "./ollama-llm.js";

export const mistralInstructLLM = new OllamaLLM(
  OLLAMA_LLM_DEFINITIONS["mistral:7b-instruct"],
  {
    promptFromMessages(messages: LLMMessage[]) {
      // https://docs.mistral.ai/llm/mistral-instruct-v0.1
      const BOS = "<s>";
      const EOS = "</s>";

      const INST_START = "[INST]";
      const INST_END = "[/INST]";

      let prompt = BOS + INST_START;
      let lastRole: string = "";

      messages.forEach((m, i) => {
        if (m.role === "system") {
          prompt += ` ${m.content.trim()}`;
        }

        if (m.role === "assistant") {
          if (lastRole === "system") {
            prompt += ` ${INST_END} ${m.content.trim()}`;
          } else if (lastRole === "assistant") {
            prompt += ` ${m.content.trim()}`;
          } else if (lastRole === "user") {
            prompt += ` ${INST_END} ${m.content.trim()}`;
          } else {
            prompt += ` ${m.content.trim()}`;
          }
        }

        if (m.role === "user" || m.role === "function") {
          if (lastRole === "system") {
            prompt += ` ${m.content.trim()}`;
          } else if (lastRole === "assistant") {
            prompt += ` ${INST_START} ${m.content.trim()}`;
          } else if (lastRole === "user") {
            prompt += ` ${m.content.trim()}`;
          } else {
            prompt += ` ${m.content.trim()}`;
          }
        }

        if (i <= messages.length - 2) {
          prompt += ` ${INST_END}${EOS} ${INST_START}`;
        }

        lastRole = m.role;
      });
      prompt += ` ${INST_END}`;

      this.log();
      this.log(prompt);
      this.log();

      return prompt;
    },
  },
);
