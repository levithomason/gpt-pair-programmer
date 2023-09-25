import { Express } from "express";
import {
  clearConsole,
  evaluate,
  getDOM,
  goto,
  log,
  readConsole,
  readPage,
} from "./utils";

export const addRoutes = (app: Express) => {
  app.post("/browser/goto", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    try {
      await goto(url);
      res.send(await readPage());
    } catch (error) {
      res.status(500).json({ error: (error as Error).toString() });
    }
  });

  app.get("/browser/dom", async (req, res) => {
    try {
      res.send(await getDOM());
    } catch (error) {
      res.status(500).json({ error: (error as Error).toString() });
    }
  });

  app.get("/browser/read", async (req, res) => {
    try {
      res.json(await readPage());
    } catch (error) {
      res.status(500).json({ error: (error as Error).toString() });
    }
  });

  app.get("/browser/console", async (req, res) => {
    res.json(readConsole());
  });

  app.delete("/browser/console", async (req, res) => {
    clearConsole();
    res.send(readConsole());
  });

  app.post("/browser/execute", async (req, res) => {
    const { command, selector, value } = req.body;

    try {
      const result = await evaluate(command, selector, value);

      res.status(200).json(result);
    } catch (error) {
      log("browser/execute", { error });
      res.status(500).json({ error: (error as Error).toString() });
    }
  });
};
