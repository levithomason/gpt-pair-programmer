import axios from "axios";
import debug from "debug";

import type {
  LLMChatCallback,
  LLMMessage,
  OllamaEmbeddingParameters,
  OllamaGenerateParameters,
  OllamaLLMDefinition,
  OllamaResponseStreaming,
  OllamaTag,
  OllamaTagsResponse,
  SupportedOllamaLLMName,
} from "../../../shared/types.js";
import { BaseError } from "../../utils/index.js";
import { BaseLLM } from "./base-llm.js";

export const OLLAMA_LLM_DEFINITIONS: Record<
  SupportedOllamaLLMName,
  OllamaLLMDefinition
> = {
  "codellama:7b": {
    name: "codellama:7b",
    description:
      "Code Llama is a model for generating and discussing code. It can also insert code.",
    contextSize: 16384,
    inputCost: 0,
    outputCost: 0,
    supportsFunctionCalling: false,
    supportsFineTuning: true,
  },
  "mistral:latest": {
    name: "mistral:latest",
    description:
      "Mistral 7B model is an Apache licensed 7.3B parameter model. It is available in both instruct (instruction following) and text completion.",
    contextSize: 8192,
    inputCost: 0,
    outputCost: 0,
    supportsFunctionCalling: false,
    supportsFineTuning: true,
  },
  "mistral:7b-instruct": {
    name: "mistral:7b-instruct",
    description:
      "Based on the foundational Mistral 7B v0.1 model and has been fine-tuned for conversation and question answering.",
    contextSize: 8192,
    inputCost: 0,
    outputCost: 0,
    supportsFunctionCalling: false,
    supportsFineTuning: true,
  },
  "openhermes2-mistral:latest": {
    name: "openhermes2-mistral:latest",
    description:
      "7B fine-tuned model based on Mistral 7B. Trained on 900k entries of primarily GPT-4 generated data from open datasets. Good for general conversation and question answering.",
    contextSize: 8192,
    inputCost: 0,
    outputCost: 0,
    supportsFunctionCalling: false,
    supportsFineTuning: true,
  },
};

export class OllamaLLM extends BaseLLM {
  static baseUrl = "http://127.0.0.1:11434/api";
  definition: OllamaLLMDefinition;

  promptFromMessages: (messages: LLMMessage[]) => string;

  constructor(
    definition: OllamaLLMDefinition,
    {
      promptFromMessages,
    }: { promptFromMessages: (messages: LLMMessage[]) => string },
  ) {
    super(definition);
    this.definition = definition;
    this.log = debug(`gpp:server:ai:llms:ollama:${definition.name}`);
    this.promptFromMessages = promptFromMessages.bind(this);
  }

  /**
   * List all installed models.
   */
  static async listModels() {
    let models: OllamaTag["name"][] = [];

    try {
      const res = await axios.get<OllamaTagsResponse>(`${this.baseUrl}/tags`);
      models = res.data.models.map((m: OllamaTag) => m.name);
    } catch (error) {
      throw new BaseError("Failed to fetch models from Ollama: " + error.stack);
    }

    return models;
  }

  /**
   * Throws an error if the specified model is not installed.
   */
  static async validateModel(model: SupportedOllamaLLMName) {
    const models = await this.listModels();

    if (!models.includes(model)) {
      const available = models.map((m) => `\n - ${m}`).join("");
      throw new BaseError(
        `Ollama model "${model}" is not installed. Available models: ${available}`,
      );
    }
  }

  /**
   * Get embeddings for a prompt.
   */
  async embeddings(prompt: string): Promise<number[]> {
    await OllamaLLM.validateModel(this.definition.name);

    return new Promise(async (resolve, reject) => {
      try {
        const url = `${OllamaLLM.baseUrl}/embeddings`;
        const res = await axios.post(
          url,
          { prompt, model: this.definition.name } as OllamaEmbeddingParameters,
          { headers: { "Content-Type": "application/json" } },
        );
        resolve(res.data.embedding);
      } catch (error) {
        throw new BaseError(
          `Failed to get embeddings from Ollama: ${error.stack}`,
        );
      }
    });
  }

  async chat({ messages, maxTokens }, cb: LLMChatCallback): Promise<any> {
    await OllamaLLM.validateModel(this.definition.name);

    const prompt = this.promptFromMessages(messages);

    try {
      const url = `${OllamaLLM.baseUrl}/generate`;
      const data: OllamaGenerateParameters = {
        model: this.definition.name,
        prompt,
        template: "{{ .Prompt }}",
        options: {
          num_predict: maxTokens,
          temperature: 0.7,
          // repeat_penalty: 1,
        },
      };

      const res = await axios.post(url, data, {
        responseType: "stream",
        headers: { "Content-Type": "application/json" },
      });

      let isFirstChunk = true;
      res.data.on("data", (chunk: string) => {
        try {
          const parsed: OllamaResponseStreaming = JSON.parse(chunk);

          // Ollama (always?) generates a space at the beginning of the first response
          if (isFirstChunk) {
            parsed.response = parsed.response.trimStart();
            isFirstChunk = false;
          }

          cb(null, {
            content: parsed.response,
            done: parsed.done,
          });
        } catch (error) {
          cb(error, {
            content: "",
            done: false,
          });
        }
      });

      res.data.on("error", (error) => {
        cb(new BaseError(`Error while reading Ollama stream: ${error.stack}`), {
          content: "",
          done: true,
        });
      });
    } catch (error) {
      cb(new BaseError(`Failed to generate from Ollama: ${error.stack}`), {
        content: "",
        done: true,
      });
    }
  }

  countTokens(text: string): Promise<number> {
    // TODO: implement token counting for Ollama
    return Promise.resolve(Math.ceil(text.length / 4));
  }
}
