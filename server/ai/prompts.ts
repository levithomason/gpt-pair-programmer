import path from "path";
import * as fs from "fs";
import debug from "debug";

import { chatGPTFunctionsPrompt, generateTree, run } from "../utils/index.js";
import { absProjectPath, settings } from "../settings.js";

import { getConsole, getPage } from "../tools/browser/utils.js";
import fileRead from "../tools/project/fileRead.js";
import getProjectTodos from "../tools/project/getProjectTodos.js";

const log = debug("gpp:server:ai:prompts");

export const promptPackageJSON = async () => {
  if (!fs.existsSync(absProjectPath("package.json"))) {
    return `No package.json found.`;
  }

  try {
    const { content } = await fileRead({ path: "package.json" });
    const packageJSON = JSON.parse(content);

    const packageScripts =
      Object.entries(packageJSON.scripts || {})
        .map(([name, script]) => {
          return `\n  - ${name}`;
        })
        .join("") || "<no scripts>";

    return `- name: ${packageJSON.name}
- version: ${packageJSON.version || "<no version>"}
- description: ${packageJSON.description || "<no description>"}
- scripts: ${packageScripts}`;
  } catch (error) {
    return `<no package.json>`;
  }
};

export const promptGit = async () => {
  if (!fs.existsSync(absProjectPath(".git"))) {
    return `<no .git directory>`;
  }

  let gitBranch: string;
  try {
    const { stdout } = await run("git symbolic-ref HEAD");
    gitBranch = stdout.replace("refs/heads/", "").trim();
  } catch (error) {
    log(`Failed to get git branch: ${error}`);
    gitBranch = "Failed to get branch: " + error.message;
  }

  let groupedStatus: string;
  try {
    const { stdout } = await run("git status --porcelain");
    const lines = stdout.trim().split("\n").filter(Boolean);
    const grouped = lines.reduce(
      (acc, line) => {
        const [status, path] = line.trim().replace(/ +/g, " ").split(" ");
        if (typeof acc[status] !== "number") acc[status] = 0;
        acc[status]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    groupedStatus =
      Object.entries(grouped)
        .map(([status, count]) => `${status}=${count}`)
        .join(" ") || "<no changes>";
  } catch (error) {
    log(`Failed to get git status: ${error}`);
    groupedStatus = "Failed to get status: " + error.message;
  }

  let unpushed: string | number;
  try {
    const { stdout } = await run(
      "git log --branches --not --remotes --oneline",
    );
    unpushed = stdout.trim().split("\n").filter(Boolean).length;
  } catch (error) {
    log(`Failed to get unpushed commits: ${error}`);
    unpushed = "Failed to get unpushed commits: " + error.message;
  }

  let firstCommit: string;
  try {
    const { stdout: shaLong } = await run("git rev-list --max-parents=0 HEAD");
    const { stdout: details } = await run(
      `git log --abbrev-commit --date=format:"%Y-%m-%d" --format="%h %cd %s" -n 1 ${shaLong.trim()}`,
    );
    const [sha, date, ...msgParts] = details.trim().split(" ");
    const msg = msgParts.join(" ");
    firstCommit = `${sha} (${date}) "${msg}"`;
  } catch (error) {
    log(`Failed to get first commit: ${error}`);
    firstCommit = "Failed to get first commit: " + error.message;
  }

  let gitLog: string;
  try {
    const { stdout } = await run(
      "git log -n 5 --oneline --no-color --date=format:'%Y-%m-%d' --format='%h %cd %s'",
    );
    gitLog = stdout
      .trim()
      .split("\n")
      .map((l) => {
        const [sha, date, ...msgParts] = l.trim().split(" ");
        const msg = msgParts.join(" ");
        return `  - ${sha} (${date}) "${msg}"`;
      })
      .join("\n");
  } catch (error) {
    log(`Failed to get git log: ${error}`);
    gitLog = "Failed to get log: " + error.message;
  }

  return `- branch: ${gitBranch}
- status: ${groupedStatus}
- unpushed: ${unpushed}
- first commit: ${firstCommit}
- recent log:\n${gitLog}
`.trim();
};

export const promptProjectOverview = async () => {
  const packageManager = fs.existsSync(absProjectPath("yarn.lock"))
    ? "yarn"
    : fs.existsSync(absProjectPath("package-lock.json"))
    ? "npm"
    : "<no yarn.lock or package-lock.json>";

  return `# PROJECT: General
- directory: ${settings.projectName}
- package manager: ${packageManager}

## PROJECT: Tree
${generateTree(absProjectPath(), { maxDepth: 1, reportContents: false })}

## PROJECT: package.json
${await promptPackageJSON()}

## PROJECT: git
${await promptGit()}
`;
};

const promptToolBrowser = async () => {
  let pageURL = "<failed to get page>";
  let consoleSummary = "<failed to get console>";

  try {
    const page = await getPage();
    pageURL = page.url();
  } catch (error) {
    log(`Failed to get page URL: ${error}`);
  }

  try {
    const $console = getConsole();
    const { errors, warnings, infos, logs } = $console.reduce(
      (acc, msg) => {
        acc[msg.type()]++;
        return acc;
      },
      { errors: 0, warnings: 0, infos: 0, logs: 0 },
    );

    consoleSummary =
      [
        errors && `${errors} error${errors > 1 ? "s" : ""}`,
        warnings && `${warnings} warning${warnings > 1 ? "s" : ""}`,
        infos && `${infos} info${infos > 1 ? "s" : ""}`,
        logs && `${logs} log${logs > 1 ? "s" : ""}`,
      ]
        .filter(Boolean)
        .join(", ") || "<no messages>";
  } catch (error) {
    log(`Failed to get console summary: ${error}`);
  }

  return `- url: ${pageURL}
- console: ${consoleSummary}`;
};

export const promptToolTodos = async () => {
  const todos = await getProjectTodos();

  const grouped = Object.entries(todos).reduce(
    (acc, [relTodoPath, todos]) => {
      // group todos by 2 dirs deep
      const shallowRoot = relTodoPath
        .split(path.sep)
        .slice(0, 2)
        .join(path.sep);

      todos.forEach(() => {
        if (typeof acc[shallowRoot] !== "number") acc[shallowRoot] = 0;
        acc[shallowRoot]++;
      });
      return acc;
    },
    {} as { [key: string]: number },
  );

  return Object.entries(grouped)
    .reduce((acc, [rootPath, count]) => {
      acc.push(`- ${rootPath}: ${count}`);
      return acc;
    }, [] as string[])
    .join("\n");
};

export const promptSystemDefault = async () => {
  return `
You are the assistant.

# THE ASSISTANT
- Is pair programming with the user on their computer.
- Calls tools to help the user reach their goals.
- Can use multiple tools together to reach a goal.
- Is concise.

# ASSISTANT CHARACTERISTICS
- Always thinks step-by-step.
- Always breaks problems down.
- Always shows its work.
- Always makes a plan.
- Always anticipates future problems.
- Always verifies its understanding with empirical project data.
- Always contextualizes its work to the project.
- Always uses specific project knowledge.
- Never makes assumptions.
- Never provides generic information.
- Never asks the user to do tasks, but does them itself.

# ASSISTANT'S CAPABILITIES
- Uses mermaid markdown graphs when explaining relationships, flows, and sequences.

# TOOLS
All tools are executed on the user's computer, with the user's permission levels.
`.trim();
};
