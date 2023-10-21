import debug from "debug";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

import type { ClientToServerEvents, ServerToClientEvents } from "../types";
import toast from "react-hot-toast";

const MAX_RECONNECTION_ATTEMPTS = 10;

const log = debug("gpp:client:hooks:use-socket-io");

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:5004",
  {
    reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
  },
);

//
// Connect
//
let toastID = "";
socket.on("connect", () => {
  toastID = toast.success("Socket connected", { id: toastID });
  log("Socket connected: ", socket.id);
});

socket.on("disconnect", () => {
  toastID = toast.error("Socket disconnected", { id: toastID });
  log("Socket disconnected: ", socket.id);
});

socket.on("connect_error", () => {
  if (reconnectionAttempts === MAX_RECONNECTION_ATTEMPTS) {
    toastID = toast.error("Socket reconnect failed", { id: toastID });
    reconnectionAttempts = 0;
  }
});

//
// Reconnect
//
let reconnectionAttempts = 0;

socket.io.on("reconnect_attempt", () => {
  reconnectionAttempts++;
  log("Socket reconnect attempt: ", reconnectionAttempts);
  toastID = toast.loading(`Socket reconnect attempt: ${reconnectionAttempts}`, {
    id: toastID,
  });
});

socket.io.on("reconnect", () => {
  log(`Socket reconnected after ${reconnectionAttempts}: `, socket.id);
  reconnectionAttempts = 0;
  toastID = toast.success("Socket reconnected", { id: toastID });
});
