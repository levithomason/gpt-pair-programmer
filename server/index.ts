import express from "express";
import { createServer } from "http";
import debug from "debug";

import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

import { setupProjectWorkingDirectory } from "./settings.js";
import { getDB, setupDB } from "./database/index.js";
import { setupSocketIO } from "./socket.io-server.js";

import { logErrors, returnErrors } from "./middleware/errors.js";
import { openApiJson } from "./utils/index.js";

import { chatGptPluginRoutes } from "./routes/chat-gpt-plugin-routes.js";
import { chatRoutes } from "./routes/chat-routes.js";
import { promptRoutes } from "./routes/prompt-routes.js";
import { settingsRoutes } from "./routes/settings-routes.js";
import { toolRoutes } from "./routes/tool-routes.js";
import { projectRoutes } from "./routes/project-routes.js";
import { databaseRoutes } from "./routes/database-routes.js";

const log = debug("gpp:server:main");

// ============================================================================
// Server Setup
// ============================================================================
const app = express();
const httpServer = createServer(app);

// ============================================================================
// Init
// ============================================================================
setupProjectWorkingDirectory();
setupSocketIO(httpServer);
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
app.use(projectRoutes);
app.use(promptRoutes);
app.use(settingsRoutes);
app.use(databaseRoutes);
app.use(toolRoutes(openApiJson));

// list all routes in the router
app.get("/", (req, res) => {
  let routes = `<div style="font-family:sans-serif;">`;
  routes += `<h1>Routes</h1>`;
  routes += `<div style="display:inline-grid;grid-template-columns: auto auto;gap:4px 8px;">`;

  const addRoute = (route) => {
    const path = route.path;
    const method = route.stack[0].method.toUpperCase();

    const methodHTML = `<span style="font-variant:all-small-caps;">${method}</span>`;
    const pathHTML = `<div><a href="${path}">${path}</a></div>`;

    routes += `${methodHTML} ${pathHTML}`;
  };

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // routes registered directly on the app
      addRoute(middleware.route);
    } else if (middleware.name === "router") {
      // router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          addRoute(handler.route);
        }
      });
    }
  });

  routes += `</div></div>`;

  res.send(routes);
});

// ============================================================================
// Server
// ============================================================================
httpServer.listen(5004, "localhost", () => {
  log("Server running on http://localhost:5004");
});
