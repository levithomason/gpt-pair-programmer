import express from "express";
import { createServer } from "http";
import debug from "debug";

import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

import { logErrors, returnErrors } from "./middleware/errors.js";
import { openApiJson } from "./utils/index.js";

import { chatGptPluginRoutes } from "./routes/chat-gpt-plugin-routes.js";
import { chatRoutes } from "./routes/chat-routes.js";
import { promptRoutes } from "./routes/prompt-routes.js";
import { settingsRoutes } from "./routes/settings-routes.js";
import { toolRoutes } from "./routes/tool-routes.js";

import { getDB, setupDB } from "./database/index.js";
import { setupSocketIO } from "./socket.io-server.js";
import { setupPaths } from "./paths.js";

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
setupPaths();

await setupDB(await getDB());

// ============================================================================
// Middleware
// ============================================================================
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      // TODO: should come up with a better way of handling urls in the project
      "http://localhost:3000", // app
      "http://localhost:5004", // server
      "https://chat.openai.com",
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
app.use(promptRoutes);
app.use(settingsRoutes);
app.use(toolRoutes(openApiJson));

// ============================================================================
// Server
// ============================================================================
httpServer.listen(5004, "localhost", () => {
  log("Server running on http://localhost:5004");
});
