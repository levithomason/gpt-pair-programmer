import * as React from "react";

import "./server-status.css";

import { classNames, makeDebug } from "../../utils";
import { socket } from "../../socket.io-client";
import { SERVER_STATUS_HEARTBEAT_INTERVAL } from "../../../shared/config";
import { useIsFirstRender } from "../../hooks/use-first-render";

const log = makeDebug("components:server-status");

export const ServerStatus = () => {
  const [status, setStatus] = React.useState("Pending");
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useIsFirstRender();

  if (isFirstRender) {
    socket.on("serverHeartbeat", () => {
      setStatus("online");

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        log("Stopped receiving heartbeats");
        setStatus("offline");
      }, SERVER_STATUS_HEARTBEAT_INTERVAL + 1000);
    });
  }

  return (
    <span
      className={classNames(
        "server-status",
        `server-status--${status.toLocaleLowerCase()}`,
      )}
      title={`Server is ${status}`}
    ></span>
  );
};
