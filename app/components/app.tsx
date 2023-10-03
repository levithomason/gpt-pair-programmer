import * as React from "react";

import "./app.css";
import { Chat } from "./chat/chat";
import { Logo } from "./logo/logo";

import background from "../../public/dark-gradient-background-with-copy-space.avif";
import { makeLogger } from "../utils";
import { Tools } from "./tools/tools";

const log = makeLogger("components:app");

const ServerStatus = () => {
  const INTERVAL = 2000;
  const [status, setStatus] = React.useState("(pending)");

  const updateStatus = () => {
    fetch(`http://localhost:5004/status`)
      .then((res) => {
        setStatus("Online");
      })
      .catch((err) => {
        setStatus("Offline");
      });
  };

  React.useEffect(() => {
    const interval = setInterval(updateStatus, INTERVAL);
    return () => clearInterval(interval);
  }, []);

  updateStatus();

  const color = {
    Online: "rgba(107,179,107,0.8)",
    Offline: "rgb(255,115,102)",
    "(pending)": "rgba(150, 150, 150, 0.8)",
  }[status];

  return (
    <div
      id="server-status"
      title={`Server is ${status}`}
      style={{
        color,
        fontFamily: "var(--font-family-mono)",
        fontWeight: status === "offline" ? "bold" : "normal",
        fontSize: 12,
      }}
    >
      <i className="fa fa-server" /> {status}
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
        <button onClick={resetChat}>Reset</button>
      </div>
      <div id="main">
        <Chat />
      </div>
      <div id="right">
        <Tools />
      </div>
      <img id="background" src={background} alt="Background" />
    </div>
  );
};
