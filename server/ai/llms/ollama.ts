import axios from "axios";
import debug from "debug";

import type {
  OllamaCallback,
  OllamaGenerateParameters,
  OllamaModel,
  OllamaTag,
  OllamaTagsResponse,
} from "../../../types.js";
import { BaseError } from "../../utils/index.js";

const log = debug("gpp:server:ai:ollama");
const baseUrl = "http://127.0.0.1:11434/api";

const validateModel = async (model: OllamaModel): Promise<void> => {
  let models: OllamaTag["name"][] = [];
  try {
    const res = await axios.get<OllamaTagsResponse>(`${baseUrl}/tags`);
    models = res.data.models.map((m: OllamaTag) => m.name);
  } catch (error) {
    throw new BaseError("Failed to fetch models from Ollama: " + error.stack);
  }

  if (!models.includes(model)) {
    const available = models.join(", ");
    throw new BaseError(
      `Ollama model "${model}" not found. Available models: ${available}`,
    );
  }
};

export const ollama = async (
  opts: Pick<
    OllamaGenerateParameters,
    "model" | "prompt" | "system" | "context"
  >,
  cb: OllamaCallback,
): Promise<void> => {
  await validateModel(opts.model);

  return new Promise(async (resolve, reject) => {
    try {
      const url = `${baseUrl}/generate`;
      const res = await axios.post(url, opts, {
        responseType: "stream",
        headers: { "Content-Type": "application/json" },
      });

      let json;
      let biggerChunk = "";
      let parseError = null;

      res.data.on("data", (chunk) => {
        biggerChunk += chunk.toString();
        try {
          json = JSON.parse(chunk);
          // parse error may happen before the stream is complete
          parseError = null;
          cb(json);
        } catch (error) {
          parseError = error;
          biggerChunk += chunk.toString();
          log(chunk.toString());
        }
      });

      res.data.on("end", () => {
        if (parseError) {
          reject(
            new BaseError(
              `Failed to parse Ollama response: ${parseError.stack}`,
            ),
          );
        } else {
          resolve();
        }
      });

      res.data.on("error", (error) => {
        reject(
          new BaseError(`Error while reading Ollama stream: ${error.stack}`),
        );
      });
    } catch (error) {
      throw new BaseError(`Failed to generate from Ollama: ${error.stack}`);
    }
  });
};
