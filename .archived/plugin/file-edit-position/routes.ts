//
// File Operations
// ChatGPT was not able to edit files based on start/end position or line/column
//

import fs from "fs";
import { getSessionState, setSessionState } from "./sessionState";
import { Express } from "express";

export const addFileEditPositionRoutes = (app: Express) => {
  app.post("/file/open", async (req, res) => {
    const filePath = req.body.filePath;
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      setSessionState({
        file: {
          path: filePath,
          content: fileContent,
        },
      });
      res.status(200).send({
        content: fileContent,
        message: "File opened successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).send({
          message: "Error opening file",
          error: error.message,
        });
      } else {
        res.status(500).send({ message: "Error opening file" });
      }
    }
  });

  app.post("/file/save", async (req, res) => {
    const { path, content } = getSessionState().file;
    try {
      fs.writeFileSync(path, content, "utf-8");
      res.status(200).send({ message: "File saved successfully" });
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(500)
          .send({ message: "Error saving file", error: error.message });
      } else {
        res.status(500).send({ message: "Error saving file" });
      }
    }
  });

  app.post("/file/edit-range", async (req, res) => {
    const { start, end, text } = req.body;
    const { path, content } = getSessionState().file;
    try {
      const newContent = content.slice(0, start) + text + content.slice(end);
      setSessionState({
        file: {
          path: path,
          content: newContent,
        },
      });
      res.status(200).send({
        content: newContent,
        message: "File edited successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        res
          .status(500)
          .send({ message: "Error editing file", error: error.message });
      } else {
        res.status(500).send({ message: "Error editing file" });
      }
    }
  });

  app.get("/file/content", async (_, res) => {
    const { content } = getSessionState().file;
    res.status(200).send({ content: content });
  });
};
