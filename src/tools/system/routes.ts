import { Express } from "express";

import { getSystemInfo, log, run } from "./utils";
import { PROJECT_ROOT } from "../../config";
import { generateTree } from "../../utils";

export const addRoutes = (app: Express) => {
  app.get("/system/info", async (req, res) => {
    const systemInfo = await getSystemInfo();

    res.status(200).json(systemInfo);
  });

  app.post("/system/exec", async (req, res) => {
    const { command, cwd = "." } = req.body;
    log("/system/exec", { command, cwd });

    if (!command) {
      res.status(400).json({ error: "No command provided" });
      return;
    }

    const shell = await run(command, cwd);
    log("system/exec", { shell });

    res.status(200).json({ shell });
  });

  app.get("/system/tree", async (req, res) => {
    const tree = generateTree(PROJECT_ROOT, 2);
    log("/system/tree", tree);
    res.status(200).json({ tree });
  });
};
