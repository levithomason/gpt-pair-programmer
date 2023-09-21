import { Express } from "express";
import fs from "fs";

import { getSystemInfo, log, run } from "./utils";
import { PROJECT_ROOT } from "../../config";
import { generateTree } from "../../utils";
import path from "path";

export const addRoutes = (app: Express) => {
  app.get("/system/docs/architecture", async (req, res) => {
    const architecture = fs.readFileSync(
      path.resolve(PROJECT_ROOT, "docs/architecture.md"),
      "utf8",
    );
    log("/system/architecture", architecture);
    res.status(200).json({ architecture });
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

  app.get("/system/info", async (req, res) => {
    const systemInfo = await getSystemInfo();

    res.status(200).json(systemInfo);
  });

  app.get("/system/tree", async (req, res) => {
    const tree = generateTree(PROJECT_ROOT, 2);
    log("/system/tree", tree);
    res.status(200).json({ tree });
  });
};
