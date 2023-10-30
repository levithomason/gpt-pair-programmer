import debug from "debug";
import type { TiktokenBPE } from "js-tiktoken/lite";
import { getEncodingNameForModel, Tiktoken } from "js-tiktoken/lite";

import type { SupportedOpenAIModel } from "../../types.js";
import { OPENAI_MODELS } from "../../shared/config.js";

const log = debug("gpp:server:utils:tokens");

export const trimStringToTokens = (
  model: SupportedOpenAIModel,
  maxTokens: number,
  text: string,
) => {
  const string = typeof text === "string" ? text : JSON.stringify(text);

  const joinText = "\n\n...TRUNCATED...\n\n";
  const joinTextTokens = countTokens(model, joinText);

  const textTokens = countTokens(model, string);
  log("trimStringToTokens", { maxTokens, textTokens });

  if (textTokens <= maxTokens) {
    log("trimStringToTokens", "no need to trim");
    return text;
  }

  const percentage = (maxTokens - joinTextTokens) / textTokens;
  const trimLength = Math.floor(text.length * percentage);

  log("trimStringToTokens", { percentage, trimLength });

  return (
    text.slice(0, trimLength / 2) +
    joinText +
    text.slice(text.length - trimLength / 2)
  );
};

//
// Token Counter
// See: https://github.com/dqbd/tiktoken/blob/main/js/examples/dynamic.ts
//
const encodingCache: Record<string, TiktokenBPE> = {};
const models = Object.values(OPENAI_MODELS);

for (const model of models) {
  const encodingName = getEncodingNameForModel(model.name);
  if (encodingCache[encodingName]) {
    log(`skip ${encodingName} for ${model.name}`);
    continue;
  } else {
    log(`cache ${encodingName} for ${model.name}`);
  }

  const res = await fetch(`https://tiktoken.pages.dev/js/${encodingName}.json`);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${encodingName}.json for ${model.name}`);
  }

  encodingCache[encodingName] = await res.json();
}

log("encodingCache", Object.keys(encodingCache));

export const countTokens = (model: SupportedOpenAIModel, text: string) => {
  const encodingName = getEncodingNameForModel(model);
  const cachedEncoding = encodingCache[encodingName];

  if (!cachedEncoding) {
    throw new Error(`Encoding ${encodingName} not found in cache`);
  }

  const encodings = new Tiktoken(cachedEncoding);

  return encodings.encode(text).length;
};
