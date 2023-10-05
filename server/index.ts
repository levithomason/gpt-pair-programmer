import express from "express";
import { createServer } from "http";
import debug from "debug";

import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

// import { wss } from "./websocket.js";
import { logErrors, returnErrors } from "./middleware/errors.js";
import { openApiJson } from "./utils/index.js";

import { chatGptPluginRoutes } from "./routes/chat-gpt-plugin-routes.js";
import { chatRoutes } from "./routes/chat-routes.js";
import { toolRoutes } from "./routes/tool-routes.js";

import { getDB, setupDB } from "./database/index.js";
import { setupSocketIO } from "./socket.io-server.js";

debug.enable("gpp:*");

const log = debug("gpp:server:main");

// ============================================================================
// Server Setup
// ============================================================================
const app = express();
const httpServer = createServer(app);

// ============================================================================
// Socket.io
// ============================================================================
setupSocketIO(httpServer);

// ============================================================================
// Init
// ============================================================================
const db = await getDB();
await setupDB(db);

// ============================================================================
// Middleware
// ============================================================================
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://chat.openai.com",
      "http://0.0.0.0:5004",
    ],
  }),
);

// errors
app.use(logErrors);
app.use(returnErrors);

// ============================================================================
// Routes
// ============================================================================
app.use(chatGptPluginRoutes);
app.use(chatRoutes);
app.use(toolRoutes(openApiJson));

app.get("/status", (req, res) => {
  res.json({ status: "ok" });
});

// ============================================================================
// Server
// ============================================================================
httpServer.listen(5004, "localhost", () => {
  log("Server running on http://localhost:5004");
});
