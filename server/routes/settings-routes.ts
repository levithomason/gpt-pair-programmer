import express from "express";
import debug from "debug";

import { listProjects, saveSettings, settings } from "../settings.js";
import { OPENAI_MODELS } from "../../shared/config.js";

const log = debug("gpp:server:routes:settings");

export const settingsRoutes = express.Router();

settingsRoutes
  .get("/settings", (_, res) => {
    res.send(settings);
  })

  .post("/settings", async (req, res) => {
    log("POST /settings", req.body);

    const { modelName, project } = req.body;

    if (modelName && !OPENAI_MODELS[modelName]) {
      const models = Object.keys(OPENAI_MODELS).join(", ");
      return res.status(400).send({
        message: `Model "${modelName}" does not exist: ${models}`,
      });
    }

    const projects = listProjects();
    if (project && !projects.includes(project)) {
      return res.status(400).send({
        message: `Project "${project}" does not exist: ${projects.join(", ")}`,
      });
    }

    try {
      saveSettings(req.body);
      res.send({ settings });
    } catch (error) {
      log("error", error);
      res.status(500).send({
        message: `Failed to save settings: ${error.message}`,
      });
    }
  })

  .get("/settings/projects", (_, res) => {
    try {
      res.send(listProjects());
    } catch (error) {
      log("error", error);
      res.status(500).send({
        message: `Failed to read settings.projectsDirectory: "${settings.projectsDirectory}": ${error.message}`,
      });
    }
  })

  .get("/settings/models", (_, res) => {
    const models = Object.values(OPENAI_MODELS);
    res.send(models);
  });
