import debug from "debug";
import type { TiktokenBPE } from "js-tiktoken/lite";
import { getEncodingNameForModel, Tiktoken } from "js-tiktoken/lite";

import type { SupportedOpenAIModels } from "../../types.js";
import { OPENAI_MODELS } from "../../shared/config.js";

const log = debug("gpp:server:utils:tokens");

/**
 * Trims a string to a certain number of estimated tokens.
 * If the string is less than the number of tokens, the string is returned as-is.
 * If truncation is required, an "..." will be inserted in the middle of the string.
 * @param {string} str
 * @param {number} tokens
 */
export const trimStringToTokens = (str: string, tokens: number) => {
  const maxCharacters = tokens * 4;

  if (str.length > maxCharacters) {
    const divider = "\n\n[TRUNCATED]\n\n";
    const start = str.slice(0, maxCharacters / 2 - divider.length);
    const end = str.slice(-maxCharacters / 2 + divider.length);

    return start + divider + end;
  }

  return str;
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

export const countTokens = (model: SupportedOpenAIModels, text: string) => {
  const encodingName = getEncodingNameForModel(model);
  const cachedEncoding = encodingCache[encodingName];

  if (!cachedEncoding) {
    throw new Error(`Encoding ${encodingName} not found in cache`);
  }

  const encodings = new Tiktoken(cachedEncoding);

  return encodings.encode(text).length;
};

export const trimMessagesToTokens = (
  messages: { content: string; tokens: number }[],
  maxTokens: number,
) => {
  let tokens = 0;
  let i = 0;

  for (; i < messages.length; i++) {
    const message = messages[i];
    tokens += message.tokens;

    if (tokens > maxTokens) {
      break;
    }
  }

  return messages.slice(0, i);
};
