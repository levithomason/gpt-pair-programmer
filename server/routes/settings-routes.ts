import express from "express";
import debug from "debug";

import type { Settings } from "../../shared/types.js";
import {
  getComputedSettings,
  listProjects,
  saveSettings,
} from "../settings.js";
import { isLLMImplemented, llmNames } from "../ai/llms/index.js";

const log = debug("gpp:server:routes:settings");

export const settingsRoutes = express.Router();

settingsRoutes
  .get("/settings", (_, res) => {
    res.send(getComputedSettings());
  })

  .post("/settings", async (req, res) => {
    log("POST /settings", req.body);

    const { modelName, projectName } = req.body as Settings;

    if (modelName) {
      if (!isLLMImplemented(modelName)) {
        const llmList = llmNames.map((p) => `  - ${p}`).join("\n");
        return res.status(400).send({
          message: `LLM "${modelName}" is not implemented. Try:\n\n${llmList}`,
        });
      }
    }

    if (projectName) {
      const projects = listProjects();
      if (!projects.includes(projectName)) {
        const projectList = projects.map((p) => `  - ${p}`).join("\n");

        return res.status(400).send({
          message: `Project "${projectName}" does not exist:\n\n${projectList}`,
        });
      }
    }

    try {
      res.send(saveSettings(req.body));
    } catch (error) {
      log("error", error);
      res.status(500).send({
        message: `Failed to save settings: ${error.toString()}`,
      });
    }
  });
