import debug from "debug";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import "./index.css";
import { App } from "./components/App";

debug.enable("app:*");

const lightEl = document.createElement("img");
lightEl.id = "light";
document.body.appendChild(lightEl);

const rootEl = document.createElement("div");
rootEl.id = "root";
document.body.appendChild(rootEl);

const root = createRoot(rootEl);
root.render(
  <ErrorBoundary fallback={<div>Something went wrong</div>}>
    <App />
  </ErrorBoundary>,
);
