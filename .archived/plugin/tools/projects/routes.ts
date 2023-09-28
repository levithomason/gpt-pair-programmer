import * as fs from "fs";
import * as path from "path";

import { Express } from "express";
import debug from "debug";

import { GPT_PROJECTS } from "../../config";
import { generateProjectTree, isCommitNeeded, run } from "./utils";
import { getSystemInfo } from "../system/utils";
const log = debug("gpp:tools:projects");

//
// State
//
type State = {
  activeProject: string;
};

const state: State = {
  activeProject: "",
};

const statePath = path.resolve(__dirname, "./state.json");

const saveState = () => {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
};

const loadState = () => {
  if (fs.existsSync(statePath)) {
    const json = fs.readFileSync(statePath, "utf8");
    Object.assign(state, JSON.parse(json));
  }
};

const initState = () => {
  log("initState");
  loadState(); // if exists
  saveState(); // create if not
};

//
// Utils
//
const ensureProjectsDirExists = () => {
  log("ensureProjectsDirExists");
  if (!fs.existsSync(GPT_PROJECTS)) {
    fs.mkdirSync(GPT_PROJECTS);
  }
};

const listProjects = (): string[] => {
  log("listProjects");
  ensureProjectsDirExists();
  return fs.readdirSync(GPT_PROJECTS);
};

const createProject = async (name: string) => {
  ensureProjectsDirExists();

  if (fs.existsSync(path.resolve(GPT_PROJECTS, name))) {
    throw new Error(`Project already exists: ${name}`);
  }

  try {
    log("createProject:", name);
    fs.mkdirSync(path.resolve(GPT_PROJECTS, name));

    setActiveProject(name);

    await run(`git init`);
    // setup gitignore
    fs.writeFileSync(
      path.resolve(GPT_PROJECTS, name, ".gitignore"),
      [`node_modules/`, ``].join("\n"),
    );

    await run(`yarn init -y`);
    await run(`git add -A .`);
    await run(`git commit -m "system: initial commit"`);

    log("Created project:", name);
  } catch (err) {
    log("Error creating project:", err);
    throw new Error(`Error creating project "${name}":` + err);
  }
};

const deleteProject = async (name: string) => {
  const absPath = path.resolve(GPT_PROJECTS, name);
  log("deleteProject:", absPath);

  await fs.promises.rm(absPath, {
    recursive: true,
    force: true,
  });

  saveState();
};

const setActiveProject = (name: string) => {
  log("setActiveProject:", name);
  if (!fs.existsSync(path.resolve(GPT_PROJECTS, name))) {
    throw new Error(`Project does not exist: ${name}`);
  }

  state.activeProject = name;
  saveState();
};

//
// Setup
//
const setup = () => {
  log("Setup:");
  ensureProjectsDirExists();
  initState();
};
setup();

//
// Routes
//
export const addRoutes = (app: Express) => {
  /**
   * Get the list of projects
   */
  app.get("/projects", async (req, res) => {
    try {
      const projects = fs.readdirSync(GPT_PROJECTS);
      log("/projects", projects);
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  /**
   * Create a project
   */
  app.post("/projects", async (req, res) => {
    log("/projects", req.body.name);

    try {
      await createProject(req.body.name);
      log("/projects successfully created project:", req.body.name);

      setActiveProject(req.body.name);

      res.status(200).json({
        projects: listProjects(),
        activeProject: state.activeProject,
        tree: generateProjectTree(state.activeProject),
        git: {
          branch: await run(`git branch --show-current`).then(({ stdout }) =>
            stdout.trim(),
          ),
        },
        system: await getSystemInfo(),
      });
    } catch (error) {
      log("/projects Error creating project:");
      res.status(400).json({
        error: (error as Error).message,
      });
    }
  });

  /**
   * Delete a project
   */
  app.delete("/projects", async (req, res) => {
    log("/projects", req.body.name);

    if (state.activeProject === req.body.name) {
      setActiveProject("");
    }

    try {
      await deleteProject(req.body.name);
      res.status(200).json({
        projects: listProjects(),
        activeProject: state.activeProject,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  /**
   * Get the active project
   */
  app.get("/projects/active", async (req, res) => {
    log("/projects/active", state.activeProject);
    res.status(200).json({
      activeProject: state.activeProject,
    });
  });

  /**
   * Set the active project
   */
  app.post("/projects/active", async (req, res) => {
    log("/projects/active", req.body.name);
    try {
      setActiveProject(req.body.name);
      res.status(200).json(state.activeProject);
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message,
      });
    }
  });

  /**
   * Executes a shell command in the active project
   */
  app.post("/projects/active/exec", async (req, res) => {
    const { command, gitCommitMessage, cwd } = req.body;

    if (!state.activeProject) {
      res.status(400).json({ error: "No active project" });
      return;
    }

    if (!command) {
      res.status(400).json({ error: "No command provided" });
      return;
    }

    const shell = await run(command, cwd);
    log("project/exec", { cwd, command, shell });

    try {
      const shouldCommit = await isCommitNeeded();

      // let eslint = null;
      // let prettier = null;

      if (shouldCommit) {
        // eslint = await runESLint();
        // log("...eslint", eslint);
        //
        // prettier = await runPrettier();
        // log("...prettier", prettier);

        log("...committing changes:", gitCommitMessage);
        await run(`git add -A .`);
        await run(`git commit -m "gpt: ${gitCommitMessage}"`);
      }
      res.status(200).json({ shell /* eslint, prettier */ });
    } catch (error) {
      res.status(500).json({ error });
    }
  });

  /**
   * Prints the file tree of the active project
   */
  app.get("/projects/active/tree", async (req, res) => {
    if (!state.activeProject) {
      // send error that there is no active project
      res.status(400).json({ error: "No active project" });
      return;
    }

    const tree = generateProjectTree(state.activeProject);
    log("/project/tree", tree);

    res.status(200).send(tree);
  });
};
