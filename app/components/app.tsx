import * as React from "react";

import "./app.css";
import { Chat } from "./chat/chat";
import { Logo } from "./logo/logo";
import background from "../../public/dark-gradient-background-with-copy-space.avif";

export const App = () => {
  return (
    <div id="app">
      <div id="header">
        <Logo />
      </div>
      <div id="main">
        <Chat />
      </div>
      <img id="background" src={background} alt="Background" />
    </div>
  );
};
