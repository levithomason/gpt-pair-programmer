import * as React from "react";

import "./app.css";
import { Chat } from "./chat/chat";
import { Logo } from "./logo/logo";

import background from "../../public/dark-gradient-background-with-copy-space.avif";
import { makeLogger } from "../utils";

const log = makeLogger("components:app");

export const App = () => {
  const resetChat = () => {
    log("resetting chat");
    fetch(`http://localhost:5004/chat/new`, { method: "POST" }).then(() => {
      location.reload();
    });
  };
  return (
    <div id="app">
      <div id="header">
        <Logo />
        <button onClick={resetChat}>New</button>
      </div>
      <div id="main">
        <Chat />
      </div>
      <img id="background" src={background} alt="Background" />
    </div>
  );
};
