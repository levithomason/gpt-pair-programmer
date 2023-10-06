import * as React from "react";

import { makeDebug } from "../../utils";
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
      setStatus("Online");

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        log("Stopped receiving heartbeats");
        setStatus("Offline");
      }, SERVER_STATUS_HEARTBEAT_INTERVAL + 1000);
    });
  }

  const color = {
    online: "rgba(107,179,107,0.8)",
    offline: "rgb(255,115,102)",
    pending: "rgba(150, 150, 150, 0.8)",
  }[status.toLocaleLowerCase()];

  return (
    <span
      id="server-status"
      title={`Server is ${status}`}
      style={{
        color,
        fontFamily: "var(--font-family-mono)",
        fontWeight: status === "Offline" ? "bold" : "normal",
        fontSize: 12,
      }}
    >
      <i className="fa fa-server" /> {status}
    </span>
  );
};
