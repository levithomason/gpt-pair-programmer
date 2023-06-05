import { Express } from "express";

import { ChatGPTFileEditor } from "./chatGPTFileEditor";

const editor = new ChatGPTFileEditor();
editor.loadState();

const getEditorView = () => ({
  fileLineCount: editor.fileLineCount,
  linesAboveWindow: editor.linesAboveWindow,
  linesBelowWindow: editor.linesBelowWindow,
  window: editor.getWindow(),
});

export const addFileEditorRoutes = (app: Express) => {
  app.post("/file-editor/open", async (req, res) => {
    const filePath = req.body.filePath;
    try {
      editor.open(filePath);
      res.status(200).send(getEditorView());
    } catch (error) {
      console.error(error);
      res.status(500).send({ error, window: "" });
    }
  });

  app.post("/file-editor/save", async (req, res) => {
    try {
      editor.save();
      res.status(200).send({ filePath: editor.filePath });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error, filePath: editor.filePath });
    }
  });

  app.get("/file-editor/window", async (_, res) => {
    res.status(200).send(getEditorView());
  });

  app.post("/file-editor/window", async (req, res) => {
    try {
      editor.replaceWindow(req.body.content);
      res.status(200).send(getEditorView());
    } catch (error) {
      console.error(error);
      res.status(500).send({ error, ...getEditorView() });
    }
  });

  app.post("/file-editor/window/scroll-up", async (req, res) => {
    const lines = req.body.lines
    editor.scrollUp(lines);
    res.status(200).send(getEditorView());
  });

  app.post("/file-editor/window/scroll-down", async (req, res) => {
    const lines = req.body.lines
    editor.scrollDown(lines);
    res.status(200).send(getEditorView());
  });

  app.get("/file-editor/window/scroll-to-top", async (_, res) => {
    editor.scrollToTop();
    res.status(200).send(getEditorView());
  });

  app.get("/file-editor/window/scroll-to-bottom", async (_, res) => {
    editor.scrollToBottom();
    res.status(200).send(getEditorView());
  });

  app.get("/file-editor/window/page-up", async (_, res) => {
    editor.pageUp();
    res.status(200).send(getEditorView());
  });

  app.get("/file-editor/window/page-down", async (_, res) => {
    editor.pageDown();
    res.status(200).send(getEditorView());
  });
};
