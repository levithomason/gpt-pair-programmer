import * as React from "react";

import "./app.css";
import { Chat } from "./chat/chat";
import { Logo } from "./logo/logo";

import background from "../../public/dark-gradient-background-with-copy-space.avif";
import { makeLogger } from "../utils";

const log = makeLogger("components:app");

const ServerStatus = () => {
  const INTERVAL = 2000;
  const [status, setStatus] = React.useState("...");

  const updateStatus = () => {
    fetch(`http://localhost:5004/status`)
      .then((res) => {
        setStatus("online");
      })
      .catch((err) => {
        setStatus("offline");
      });
  };

  React.useEffect(() => {
    const interval = setInterval(updateStatus, INTERVAL);
    return () => clearInterval(interval);
  }, []);

  updateStatus();

  const color = {
    online: "rgba(36, 150, 36, 0.8)",
    offline: "rgba(150, 36, 36, 0.8)",
    "...": "rgba(150, 150, 150, 0.8)",
  }[status];

  return (
    <div
      id="server-status"
      style={{ color, fontFamily: "var(--font-family-mono)", fontSize: 12 }}
    >
      Server: {status}
    </div>
  );
};

export const App = () => {
  const resetChat = () => {
    if (!confirm("RESET the db?")) {
      return;
    }

    log("resetting chat");
    fetch(`http://localhost:5004/chat/new`, { method: "POST" }).then(() => {
      location.reload();
    });
  };
  return (
    <div id="app">
      <div id="header">
        <Logo />
        <ServerStatus />
        <button onClick={resetChat}>New</button>
      </div>
      <div id="main">
        <Chat />
      </div>
      <img id="background" src={background} alt="Background" />
    </div>
  );
};
