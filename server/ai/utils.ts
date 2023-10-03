import { OpenAI } from "openai";
import debug from "debug";

import { OPENAI_MODELS } from "../../config.js";
import { BaseError, retryUntil } from "../utils/index.js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/index.js";

// TODO: this should be moved to state and selectable by the user
export const MODEL = OPENAI_MODELS["gpt-3.5-turbo"];

const log = debug("gpp:server:ai:utils");

// TODO: add an env solution to handle env vars and validation
const { OPENAI_API_KEY } = process.env;
if (!OPENAI_API_KEY) {
  throw new BaseError("Missing OPENAI_API_KEY environment variable.");
}

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

//
// Utilities
//

export const getChatCompletion = async (
  messages: ChatCompletionMessageParam[],
) => {
  const result = await openai.chat.completions.create({
    model: MODEL.name,
    messages,
    stream: false,
    n: 1,
  });
  return result.choices[0].message.content;
};

export const determineNextStep = async (messages) => {
  const nextBestStep = retryUntil(
    async () => {
      return await getChatCompletion([
        {
          role: "system",
          content: [
            "Determine the best next step:",
            "1: Get more information",
            "2: Make a plan",
            "3: Take action",
            "",
            "Respond with this schema:",
            "<number>",
            "",
            "###",
            "",
          ].join("\n"),
        },
        ...messages,
      ]);
    },
    async (res) => res === "1" || res === "2" || res === "3",
  );

  log("nextBestStep", nextBestStep);

  return nextBestStep;
};

export const summarize = async (messages: ChatCompletionMessageParam[]) => {
  const result = await getChatCompletion([
    ...messages,
    {
      role: "user",
      content: "Summarize this chat.",
    },
  ]);
};
