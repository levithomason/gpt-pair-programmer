import express from "express";
import debug from "debug";
import {
  expandProjectFileResult,
  filesToIndex,
  indexProjectFiles,
  mergeProjectFileResults,
  projectFileToSearchResultString,
  searchProjectFiles,
} from "../ai/vector-store/project-files.js";

const log = debug("gpp:server:routes:project");

export const vectorStoreRoutes = express.Router();

vectorStoreRoutes
  .get("/vector-store/files", async (req, res) => {
    try {
      const files = await filesToIndex();
      res.status(200).json({ count: files.length, files });
    } catch (error) {
      log(error);
      res
        .setHeader("Content-Type", "text/plain")
        .status(500)
        .send(error.toString());
    }
  })

  .post("/vector-store/index-project", async (_, res) => {
    try {
      await indexProjectFiles();
      res.setHeader("Content-Type", "text/plain").status(200).send("OK");
    } catch (error) {
      log(error.message, error.stack);
      res
        .setHeader("Content-Type", "text/plain")
        .status(500)
        .send(error.toString());
    }
  })

  .get("/vector-store/search", async (req, res) => {
    const { query, limit = 1, expand = 0, print = false } = req.query;

    try {
      let results: any = await searchProjectFiles({
        query: query.toString(),
        limit: +limit,
      });

      // merge
      results = mergeProjectFileResults(results);

      if (expand) {
        results = await Promise.all(
          results.map((result) => expandProjectFileResult(result, +expand)),
        );
      }

      if (print) {
        results = results.map(projectFileToSearchResultString).join("\n\n");
      }

      if (print) {
        res.setHeader("Content-Type", "text/plain").status(200).send(results);
      } else {
        res.status(200).json(results);
      }
    } catch (error) {
      log(error);
      res.setHeader("Content-Type", "text/plain").status(500).send(error);
    }
  });
