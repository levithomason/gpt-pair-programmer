import express from "express";
import debug from "debug";
import { filesToIndex, indexProject } from "../ai/vector-store.js";

const log = debug("gpp:server:routes:project");

export const projectRoutes = express.Router();

projectRoutes
  .get("/vector-store/files", async (req, res) => {
    try {
      const files = await filesToIndex();
      res.status(200).json(files);
    } catch (error) {
      log(error);
      res.status(500).send(error);
    }
  })

  .post("/vector-store/index-project", async (_, res) => {
    try {
      await indexProject();
      res.status(200).send("OK");
    } catch (error) {
      log(error.message, error.stack);
      res.status(500).send(error);
    }
  });

// .post("/vector-store/search", async (req, res) => {
//   const { query } = req.body;
//
//   try {
//     const results = await searchStore({ query });
//     res.status(200).send(results);
//   } catch (error) {
//     log(error);
//     res.status(500).send(error);
//   }
// });
