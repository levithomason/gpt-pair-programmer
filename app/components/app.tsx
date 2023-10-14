import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";

import "./app.css";

import { makeDebug } from "../utils";
import background from "../../public/dark-gradient-background-with-copy-space.avif";

import { Chat } from "./chat/chat";
import { Logo } from "./logo/logo";
import { Tools } from "./tools/tools";
import { ServerStatus } from "./server-status/server-status";
import { SelectProject } from "./select-project/select-project";
import { SelectModel } from "./select-project/select-model";

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
          <div className="header__item">
            <Logo />
            <ServerStatus />
          </div>
          <div className="header__item">
            <SelectProject />
            <SelectModel />
          </div>
          <div className="header__item">
            <button
              className="button--icon button--transparent"
              onClick={resetChat}
            >
              <FontAwesomeIcon icon={faDatabase} />
            </button>
            <button
              onClick={() => setShowRight(!showRight)}
              className="button--icon button--transparent"
              title='Show "Tools"'
            >
              <FontAwesomeIcon
                icon={showRight ? faAnglesRight : faAnglesLeft}
              />
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
