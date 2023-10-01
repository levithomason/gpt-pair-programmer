import express from "express";
import debug from "debug";

import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import session from "express-session";

import { logErrors, returnErrors } from "./middleware/errors.js";
import { openApiJson } from "./utils/index.js";

import { pluginRoutes } from "./routes/plugin-routes.js";
import { chatRoutes } from "./routes/chat-routes.js";
import { toolRoutes } from "./routes/tool-routes.js";

debug.enable("gpp:*");

const log = debug("gpp:server:main");
const app = express();

// ============================================================================
// Init
// ============================================================================

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
app.use(
  session({
    secret: "foo bar baz",
    cookie: { secure: process.env.NODE_ENV === "production" },
  }),
);

// errors
app.use(logErrors);
app.use(returnErrors);

// ============================================================================
// Add Routes
// ============================================================================
app.use(pluginRoutes);
app.use(chatRoutes);
app.use(toolRoutes(openApiJson));

// ============================================================================
// Server
// ============================================================================

app.listen(5004, "0.0.0.0", () => {
  log("Server running on http://0.0.0.0:5004");
});
