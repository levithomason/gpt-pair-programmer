import debug from "debug";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

import type { ClientToServerEvents, ServerToClientEvents } from "../types";

const log = debug("gpp:client:hooks:use-socket-io");

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:5004",
);

//
// Connect
//
socket.on("connect", () => {
  log("Socket connected: ", socket.id);
});

socket.on("disconnect", () => {
  log("Socket disconnected: ", socket.id);
});

socket.on("connect_error", () => {
  socket.connect();
});

//
// Reconnect
//
let reconnectionAttempts = 0;

socket.io.on("reconnect_attempt", () => {
  reconnectionAttempts++;
  log("Socket reconnect attempt: ", reconnectionAttempts);
});

socket.io.on("reconnect", () => {
  log(`Socket reconnected after ${reconnectionAttempts}: `, socket.id);
  reconnectionAttempts = 0;
});
