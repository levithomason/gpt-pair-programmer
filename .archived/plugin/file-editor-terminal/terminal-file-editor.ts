/**
 *
 * NOTE: This was a failure as there is no reliable way to capture terminal UI.
 *
 */
import fs from "fs";

import express from "express";
import morgan from "morgan";

const { spawn, ChildProcess } = require("child_process");
const app = express();

let nanoProcess: typeof ChildProcess | undefined;

interface Key {
  key: string;
  arrow?: "up" | "down" | "right" | "left";
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

app.use(express.json());
app.use(morgan("dev"));

app.post("/nano/open", (req, res) => {
  const { fileName } = req.body;

  if (!fileName) {
    res.status(400).json({ error: "Missing fileName in the request body." });
    return;
  }

  if (nanoProcess) {
    nanoProcess.kill();
  }

  const out = fs.createWriteStream("./gpt-home/out.log", { flags: "a" });
  const err = fs.createWriteStream("./gpt-home/err.log", { flags: "a" });

  out.on("open", function (fd) {
    err.on("open", function (fd) {
      nanoProcess = spawn("nano", [fileName], {
        stdio: ["ignore", out, err],
      });

      // let output = "";

      // nanoProcess.stdout.on("data", (data: string) => {
      //   console.log("nano/open data:", typeof data);
      //   output += data.toString();
      // });

      // nanoProcess.stderr.on("data", (data: string) => {
      //   console.error(`nano/open stderr: ${data}`);
      // });

      // nanoProcess.on("close", (code: string) => {
      //   console.log(`nanoProcess exited with code ${code}`);
      // });

      // We don't have an end event as nano is a long running process.
      // We need to determine when to respond to the user after nano opens.
      // We will check the output of nano every 100ms
      // If it has been stable for 3 checks, we will respond to the user.

      let lastOutput = "";
      let lastOutputStableCount = 0;
      const interval = setInterval(() => {
        const output = fs.readFileSync("./gpt-home/out.log", "utf-8");

        if (lastOutput === output) {
          lastOutputStableCount++;
        } else {
          lastOutputStableCount = 0;
        }
        lastOutput = output;

        if (lastOutputStableCount >= 10) {
          console.log("nano/open stable:");
          console.log(output);
          clearInterval(interval);
          res.json({ stdout: output, stderr: "" });
        }
      }, 100);
    });
  });
});

app.post("/nano/keys", async (req, res) => {
  const keys: Key[] = req.body.keys;

  if (!keys) {
    res.status(400).json({ error: "Missing keys in the request body." });
    return;
  }

  if (!nanoProcess) {
    res.status(400).json({
      error: "No nano process is currently running. Open a file first.",
    });
    return;
  }

  const writePromises = keys.map(({ key, ctrl, alt, shift, meta, arrow }) => {
    return new Promise((resolve, reject) => {
      // Prepare modifier keys
      let keysToSend = "";
      if (ctrl) keysToSend += "\x1b";
      if (alt) keysToSend += "\x1b";
      if (shift) key = key.toUpperCase();
      if (meta) keysToSend += "\x1b"; // Assuming meta is Command key
      if (arrow) {
        const dir = { up: "A", down: "B", right: "C", left: "D" }[arrow];
        keysToSend += `\x1b[${dir}`;
      }

      // console.log("key       :", key);
      // console.log("keysToSend:", keysToSend);

      nanoProcess.stdin.write(keysToSend, (err: string) => {
        if (err) reject(err);
        else resolve("key sent");
      });
    });
  });

  try {
    await Promise.all(writePromises);
    res.status(200).json({
      stdout: nanoProcess.stdout.read(),
      stderr: nanoProcess.stderr.read(),
    });
  } catch (err) {
    res.status(500).json({
      error: err,
      stdout: nanoProcess.stdout.read(),
      stderr: nanoProcess.stderr.read(),
    });
  }
});

app.listen(3000, () => {
  // console.log("Server is running on port 3000");
});
