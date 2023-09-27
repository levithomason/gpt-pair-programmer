import { Express } from "express";

import { findTODOsInDirectory, log } from "./utils";
import { PROJECT_ROOT } from "../../../config";
import { generateTree, run } from "../../utils";

export const addRoutes = (app: Express) => {
  app.post("/project/exec", async (req, res) => {
    const { command, cwd = "." } = req.body;
    log("/project/exec", { command, cwd });

    if (!command) {
      res.status(400).json({ error: "No command provided" });
      return;
    }

    const shell = await run(command, cwd);
    log("project/exec", { shell });

    res.status(200).json(shell);
  });

  app.get("/project/todos", (req, res) => {
    const todos = findTODOsInDirectory(PROJECT_ROOT);
    log("/project/todos", todos);
    res.status(200).send(todos);
  });

  app.get("/project/tree", async (req, res) => {
    const tree = generateTree(PROJECT_ROOT, 3);
    log("/project/tree", tree);
    res.status(200).send(tree);
  });
};
