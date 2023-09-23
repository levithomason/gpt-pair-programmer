import { Express } from "express";
import { google } from "./utils";

export const addRoutes = (app: Express) => {
  app.post("/google", async (req, res) => {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    try {
      res.json(await google(query));
    } catch (error) {
      res.status(500).json({ error: (error as Error).toString() });
    }
  });
};
