import * as React from "react";

import { makeDebug } from "../../utils";

const log = makeDebug("components:app");

export const ServerStatus = () => {
  const INTERVAL = 2000;

  const [status, setStatus] = React.useState("Pending");

  const updateStatus = () => {
    fetch(`http://localhost:5004/status`)
      .then((res) => {
        log("ServerStatus: connected");
        setStatus("Online");
      })
      .catch((err) => {
        log("ServerStatus: disconnected");
        setStatus("Offline");
      });
  };

  React.useEffect(() => {
    updateStatus();

    const interval = setInterval(updateStatus, INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const color = {
    Online: "rgba(107,179,107,0.8)",
    Offline: "rgb(255,115,102)",
    Pending: "rgba(150, 150, 150, 0.8)",
  }[status];

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
