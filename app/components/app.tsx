import * as React from "react";

import "./app.css";

import { classNames, makeDebug } from "../utils";
import background from "../../public/dark-gradient-background-with-copy-space.avif";

import { Chat } from "./chat/chat";
import { Logo } from "./logo/logo";
import { Tools } from "./tools/tools";
import { ServerStatus } from "./server-status/server-status";

const log = makeDebug("components:app");

export const App = () => {
  const [showRight, setShowRight] = React.useState<boolean>(false);

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
      <div id="main">
        <div id="header">
          <Logo />
          <ServerStatus />
          <div>
            <button className="button--transparent" onClick={resetChat}>
              Reset
            </button>
            <button
              onClick={() => setShowRight(!showRight)}
              className="button--transparent"
              title='Show "Tools"'
            >
              <i
                className={classNames(
                  "fa",
                  showRight ? "fa-angles-right" : "fa-angles-left",
                )}
              ></i>
            </button>
          </div>
        </div>
        <Chat />
      </div>
      {showRight && (
        <div id="right">
          <Tools />
        </div>
      )}
      <img id="background" src={background} alt="Background" />
    </div>
  );
};
