import { Express } from "express";
import { clearConsole, getDOM, goto, readConsole, readPage } from "./utils";

export const addRoutes = (app: Express) => {
  app.post("/browser/goto", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    try {
      await goto(url);
      res.send({
        dom: await getDOM(),
        console: readConsole(),
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/browser/dom", async (req, res) => {
    try {
      res.json({ dom: await getDOM() });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/browser/read", async (req, res) => {
    try {
      res.json(await readPage());
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/browser/console", async (req, res) => {
    res.json({ console: readConsole() });
  });

  app.delete("/browser/console", async (req, res) => {
    clearConsole();
    res.json({ console: readConsole() });
  });
};
