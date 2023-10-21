import express from "express";
import debug from "debug";
import { getDB, resetDB } from "../database/index.js";

const log = debug("gpp:server:routes:database");

export const databaseRoutes = express.Router();

databaseRoutes.get("/db/reset", async (req, res) => {
  try {
    const db = await getDB();
    await resetDB(db);
    res.status(200).send("OK");
  } catch (error) {
    res.status(500).send(error);
  }
});
