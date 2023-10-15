import express from "express";
import debug from "debug";

import type { Settings } from "../../types.js";
import {
  getComputedSettings,
  listProjects,
  saveSettings,
} from "../settings.js";
import { OPENAI_MODELS } from "../../shared/config.js";

const log = debug("gpp:server:routes:settings");

export const settingsRoutes = express.Router();

settingsRoutes
  .get("/settings", (_, res) => {
    res.send(getComputedSettings());
  })

  .post("/settings", async (req, res) => {
    log("POST /settings", req.body);

    const { modelName, projectName } = req.body as Settings;

    if (modelName && !OPENAI_MODELS[modelName]) {
      const models = Object.keys(OPENAI_MODELS).join(", ");
      return res.status(400).send({
        message: `Model "${modelName}" does not exist: ${models}`,
      });
    }

    if (projectName) {
      const projects = listProjects();
      if (!projects.includes(projectName)) {
        return res.status(400).send({
          message: `Project "${projectName}" does not exist: ${projects.join(
            ", ",
          )}`,
        });
      }
    }

    try {
      res.send(saveSettings(req.body));
    } catch (error) {
      log("error", error);
      res.status(500).send({
        message: `Failed to save settings: ${error.message}`,
      });
    }
  });
