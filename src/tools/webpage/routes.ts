import { Express } from "express";
import {
  clearConsole,
  closeBrowser,
  openPage,
  readConsole,
  getDOM,
  readPage,
} from "./utils";

export const addRoutes = (app: Express) => {
  app.post("/webpage/open", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    try {
      await openPage(url);
      res.send(await readPage());
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/webpage/close", async (req, res) => {
    try {
      await closeBrowser();
      res.json({ message: "Page closed" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/webpage/dom", async (req, res) => {
    try {
      res.json({ dom: await getDOM() });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/webpage/read", async (req, res) => {
    try {
      res.json({ dom: await getDOM() });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/webpage/console", async (req, res) => {
    res.json({ console: readConsole() });
  });

  app.delete("/webpage/console", async (req, res) => {
    clearConsole();
    res.json({ console: readConsole() });
  });
};
