import OpenAI from "openai";
import type { Stream } from "openai/streaming.js";
import type { ChatCompletionChunk } from "openai/resources/chat/completions.js";
import debug from "debug";
import type { TiktokenBPE } from "js-tiktoken/lite";
import { getEncodingNameForModel, Tiktoken } from "js-tiktoken/lite";

import type {
  LLMChatCallback,
  LLMMessage,
  OpenAIEmbeddingLLM,
  OpenAILLMDefinition,
  SupportedOpenAIEmbeddingLLMName,
  SupportedOpenAILLMName,
} from "../../../shared/types.js";
import { BaseError, openAIFunctions } from "../../utils/index.js";

import { BaseLLM } from "./base-llm.js";

const log = debug("gpp:server:ai:llms:openai");

export const OPENAI_LLM_DEFINITIONS: Record<
  SupportedOpenAILLMName,
  OpenAILLMDefinition
> = {
  "gpt-3.5-turbo": {
    name: "gpt-3.5-turbo",
    description:
      "Most capable GPT-3.5 model and optimized for chat at 1/10th the cost of text-davinci-003.",
    contextSize: 4097,
    inputCost: 0.0015,
    outputCost: 0.002,
    supportsFunctionCalling: true,
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
    supportsFunctionCalling: true,
    supportsFineTuning: false,
  },
  "gpt-4-32k": {
    name: "gpt-4-32k",
    description:
      "Same capabilities as the standard gpt-4 mode but with 4x the context length.",
    contextSize: 32768,
    inputCost: 0.06,
    outputCost: 0.12,
    supportsFunctionCalling: true,
    supportsFineTuning: false,
  },
};

// TODO: this is unused
//  are we really going to support this given local models are faster, better, safer?
export const OPENAI_EMBEDDING_DEFINITION: Record<
  SupportedOpenAIEmbeddingLLMName,
  OpenAIEmbeddingLLM
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

//
// Token Counter
// See: https://github.com/dqbd/tiktoken/blob/main/js/examples/dynamic.ts
const encodingCache: Record<string, TiktokenBPE> = {};
const models = Object.values(OPENAI_LLM_DEFINITIONS);

for (const model of models) {
  const encodingName = getEncodingNameForModel(model.name);
  if (encodingCache[encodingName]) {
    log(`skip ${encodingName} for ${model.name}`);
    continue;
  } else {
    log(`cache ${encodingName} for ${model.name}`);
  }

  // TODO: handle offline mode... drop OpenAI? Cache these locally?
  const res = await fetch(`https://tiktoken.pages.dev/js/${encodingName}.json`);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${encodingName}.json for ${model.name}`);
  }

  encodingCache[encodingName] = await res.json();
}

log("encodingCache", Object.keys(encodingCache));

export class OpenAILLM extends BaseLLM {
  definition: OpenAILLMDefinition;

  constructor(definition: OpenAILLMDefinition) {
    super(definition);
    this.definition = definition;
    this.log = debug(`gpp:server:ai:llms:openai:${definition.name}`);
  }

  async embeddings(text: string): Promise<number[]> {
    // TODO: implement this? Local models are faster and better on benchmarks.
    throw new BaseError(
      "TODO: implement this? Local models are faster and better on benchmarks.",
    );
  }

  async chat(
    { messages, maxTokens }: { messages: LLMMessage[]; maxTokens: number },
    cb: LLMChatCallback,
  ): Promise<void> {
    // TODO: add an env solution to handle env vars and validation
    const { OPENAI_API_KEY } = process.env;
    if (!OPENAI_API_KEY) {
      throw new BaseError("Missing OPENAI_API_KEY environment variable.");
    }

    let openai: OpenAI;
    try {
      openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    } catch (error) {
      cb(new BaseError(`Error creating OpenAI client: "${error}"`), {
        content: "",
        done: true,
      });
      return;
    }

    let stream: Stream<ChatCompletionChunk>;
    try {
      stream = await openai.chat.completions.create({
        model: this.definition.name,
        messages: messages,
        stream: true,
        n: 1,
        max_tokens: maxTokens,
        functions: openAIFunctions,
        function_call: "auto",
        temperature: 0.5,
      });
    } catch (error) {
      const baseError = new BaseError(`Error calling OpenAI: "${error}"`);
      cb(baseError, { content: "", done: true });
      return;
    }

    let func = "";
    let args = "";

    for await (const part of stream) {
      const { delta, finish_reason } = part.choices[0];
      // openai can return an undefined content, ensure it is a string
      const { content = "", function_call } = delta;

      if (function_call?.name) {
        const content = function_call?.name;
        func += content;
        cb(null, { content, done: false });
      }

      if (function_call?.arguments) {
        const content = function_call?.arguments;
        args += content;
        cb(null, { content, done: false });
      }

      switch (finish_reason) {
        case "stop": {
          this.log("finish_reason", finish_reason);
          cb(null, { content, done: true });
          break;
        }

        case "length": {
          this.log("finish_reason", finish_reason);
          cb(null, { content: "\n\n...reached max length", done: true });
          break;
        }

        case "function_call": {
          this.log("finish_reason", finish_reason);

          const printArgs = args === "{}" ? "" : args;
          cb(null, {
            content: `\`${func}(${printArgs})\``,
            done: true,
            functionCall: { name: func, arguments: args },
          });
          break;
        }

        case "content_filter": {
          cb(null, {
            content: `\n\n...OpenAI content filter encountered: "${content}"`,
            done: true,
          });
          break;
        }

        case null: {
          cb(null, { content, done: false });
          break;
        }

        default: {
          const json = JSON.stringify(delta, null, 2);
          this.log("unknown finish_reason:", finish_reason, "delta:", json);

          const error = new BaseError(
            `Unknown finish_reason "${finish_reason}". delta = ${json}`,
          );
          cb(error, { content, done: true });
        }
      }
    }
  }

  async countTokens(text: string): Promise<number> {
    const encodingName = getEncodingNameForModel(this.definition.name);
    const cachedEncoding = encodingCache[encodingName];

    if (!cachedEncoding) {
      throw new Error(`Encoding ${encodingName} not found in cache`);
    }

    const encodings = new Tiktoken(cachedEncoding);

    return encodings.encode(text).length;
  }
}
