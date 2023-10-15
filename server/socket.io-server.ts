import debug from "debug";
import { Server } from "socket.io";

import { BaseError } from "./utils/index.js";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types.js";
import { SERVER_STATUS_HEARTBEAT_INTERVAL } from "../shared/config.js";
import { getComputedSettings } from "./settings.js";

const log = debug("gpp:server:socket.io-server");

let io: Server;

export const setupSocketIO = (httpServer: any) => {
  if (io) throw new BaseError("Socket.io server already setup.");

  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    // By default, the Socket.IO server exposes a client bundle at /socket.io/socket.io.js.
    // io will be registered as a global variable.
    // We prefer to import the socket.io-client package directly.
    serveClient: false,

    // allow frontend to connect to the socket.io server
    cors: {
      origin: "http://localhost:3000", // Allow requests from this origin
      methods: ["GET", "POST"], // Allow these HTTP methods
      // allowedHeaders: ["my-custom-header"], // Allow these custom headers (if any)
      credentials: true, // Allow cookies to be sent with requests
    },
  });

  io.on("connection", (socket) => {
    log("connection ", socket.id);
    io.emit("serverHeartbeat");
    io.emit("settingsComputed", getComputedSettings());
  });

  io.on("disconnect", (socket) => {
    log("disconnect ", socket.id);
  });

  setInterval(() => {
    io.emit("serverHeartbeat");
  }, SERVER_STATUS_HEARTBEAT_INTERVAL);
};

export const getSocketIO = (): Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> => {
  if (!io)
    throw new BaseError(
      "Socket.io server not setup yet. Call setupSocketIO() first.",
    );

  return io;
};
