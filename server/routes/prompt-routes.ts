import express from "express";
import debug from "debug";

import { promptSystemDefault } from "../ai/prompts.js";
import { settings } from "../settings.js";
import { getLLM } from "../ai/llms/index.js";
import { chatGPTFunctionsPrompt } from "../utils/index.js";

const log = debug("gpp:server:routes:settings");

export const promptRoutes = express.Router();

promptRoutes
  .get("/prompts/system", async (_, res) => {
    const llm = getLLM(settings.modelName);
    const prompt = await promptSystemDefault();

    res.send({
      prompt,
      tokens: await llm.countTokens(prompt),
    });
  })

  .get("/prompts/chatgpt", async (_, res) => {
    const llm = getLLM(settings.modelName);
    const prompt = chatGPTFunctionsPrompt;

    res.send({
      prompt,
      tokens: await llm.countTokens(prompt),
    });
  });
