import { Express } from "express";

import { getSystemInfo, getSystemLocation } from "./utils";

export const addRoutes = (app: Express) => {
  app.get("/system/info", async (req, res) => {
    const systemInfo = await getSystemInfo();

    res.status(200).json(systemInfo);
  });

  app.get("/system/location", async (req, res) => {
    const systemInfo = await getSystemLocation();

    res.status(200).json(systemInfo);
  });
};
