import express from "express";
import debug from "debug";

import { promptSystemDefault } from "../ai/prompts.js";
import { countTokens } from "../utils/index.js";
import { getComputedSettings } from "../settings.js";

const log = debug("gpp:server:routes:settings");

export const promptRoutes = express.Router();

promptRoutes.get("/prompts/system", async (_, res) => {
  const prompt = await promptSystemDefault();
  const { model } = getComputedSettings();

  res.send({
    prompt: prompt,
    tokens: countTokens(model.name, prompt),
  });
});
