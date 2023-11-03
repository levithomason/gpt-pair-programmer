import debug from "debug";

import type {
  SupportedLLMName,
  LLMChatCallback,
  LLMDefinition,
  LLMMessage,
} from "../../../shared/types.js";
import { BaseError } from "../../utils/index.js";

export class BaseLLM {
  log: debug.Debugger;
  definition: LLMDefinition<SupportedLLMName>;
  contextSize: number;

  constructor(definition: LLMDefinition<SupportedLLMName>) {
    this.log = debug(`gpp:server:ai:llms:${definition.name}`);
    this.definition = definition;
  }

  get name() {
    return this.definition.name;
  }

  chat(
    { messages, maxTokens }: { messages: LLMMessage[]; maxTokens: number },
    cb: LLMChatCallback,
  ): Promise<void> {
    throw new BaseError("Not implemented");
  }

  classify(text: string) {
    throw new BaseError("Not implemented");
  }

  complete(text: string) {
    throw new BaseError("Not implemented");
  }

  embeddings(text: string): Promise<number[]> {
    throw new BaseError("Not implemented");
  }

  countTokens(text: string): Promise<number> {
    throw new BaseError("Not implemented");
  }
}
