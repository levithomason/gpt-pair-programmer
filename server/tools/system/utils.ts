import * as fs from "fs";
import os from "os";

import { run } from "../../utils.js";

/**
 * Returns information about the operating system and environment.
 */
export const getInfo = async () => {
  const git = await run("git -v");

  const cpu = os.cpus();

  // disk
  const diskPath = os.platform() === "win32" ? "c:" : "/";
  const diskStats = await fs.promises.statfs(diskPath);
  const diskTotal = diskStats.blocks * diskStats.bsize;
  const diskFree = diskStats.bfree * diskStats.bsize;

  return {
    username: os.userInfo().username,
    permissions: await run("id").then(({ stdout }) => stdout.trim()),
    os: {
      type: os.type(),
      platform: os.platform(),
      release: os.release(),
      version: os.version(),
      arch: os.arch(),
      machine: os.machine(),
    },
    cpu: { model: cpu[0].model, cores: cpu.length },
    memory: { total: os.totalmem(), free: os.freemem() },
    disk: { total: diskTotal, free: diskFree },
    terminal: {
      shell: os.userInfo().shell,
      pwd: await run("pwd").then(({ stdout }) => stdout.trim()),
      homedir: os.userInfo().homedir,
    },
    // installedSoftware: await getInstalledSoftware(),
    clis: {
      git: git.stdout.replace(/[^0-9.]/g, ""),
      node: process.versions.node,
      yarn: await run("yarn -v").then(({ stdout }) => stdout),
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    time: new Date().toLocaleString(),
  };
};

// const getAvailableCLIs = async () => {
//   const pathString = process.env.PATH || "";
//   const pathDirectories = pathString.split(path.delimiter);
//
//   const cliList = new Set();
//
//   for (const dir of pathDirectories) {
//     try {
//       const files = await fs.promises.readdir(dir);
//       for (const file of files) {
//         try {
//           const filePath = path.join(dir, file);
//           const stats = await fs.promises.stat(filePath);
//           if (stats.isFile() && stats.mode & 1) {
//             // Check if it's an executable file
//             cliList.add(file);
//           }
//         } catch (err) {
//           // Ignore errors for individual files
//         }
//       }
//     } catch (err) {
//       // Ignore errors for individual directories
//     }
//   }
//
//   return Array.from(cliList);
// };

// type ShellPath = "/bin/zsh" | "/bin/bash" | "/usr/bin/fish";
// const getShellHistory = async () => {
//   const defaultShell: ShellPath = process.env.SHELL || "/bin/zsh";
//
//   const commonHistoryFiles = {
//     zsh: ".zsh_history",
//     bash: ".bash_history",
//     fish: ".local/share/fish/fish_history",
//   };
//   const histories = {};
//   for (const [shell, historyFile] of Object.entries(commonHistoryFiles)) {
//     histories[shell] = await readHistoryFile(historyFile);
//   }
//   return histories;
//
//   // // For checking the default shell and its history
//   // const shellHistoryFiles = {
//   //   "/bin/zsh": ".zsh_history",
//   //   "/bin/bash": ".bash_history",
//   //   "/usr/bin/fish": ".local/share/fish/fish_history",
//   // };
//   // return await readHistoryFile(shellHistoryFiles[defaultShell]);
// };
//
// const readHistoryFile = async (historyFile: string) => {
//   const filePath = path.join(os.homedir(), historyFile);
//   try {
//     const history = await fs.promises.readFile(filePath, "utf-8");
//     return history.split("\n").filter((line) => line.trim() !== "");
//   } catch (error) {
//     return []; // Return empty array if history file is not found or not readable
//   }
// };
