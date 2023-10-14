import fs from "fs";
import path from "path";

import express from "express";
import debug from "debug";

import { PUBLIC_ROOT, SERVER_ROOT } from "../paths.js";
import { openApiYaml } from "../utils/index.js";

const log = debug("gpp:server:routes:plugin");

export const chatGptPluginRoutes = express.Router();

chatGptPluginRoutes
  .get("/logo.png", (_, res) => {
    const filename = "logo-white-bg.png";
    res.sendFile(filename, { root: PUBLIC_ROOT });
  })

  .get("/.well-known/ai-plugin.json", (_, res) => {
    fs.readFile(
      path.resolve(SERVER_ROOT, ".well-known", "ai-plugin.json"),
      "utf8",
      (err, data) => {
        if (err) {
          log(err);
          res.status(500).send("Error");
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(data);
      },
    );
  })

  .get("/openapi.yaml", (_, res) => {
    res.setHeader("Content-Type", "text/yaml");
    res.status(200).send(openApiYaml);
  });
