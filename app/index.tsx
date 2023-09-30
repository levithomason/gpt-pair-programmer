import debug from "debug";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import "./index.css";
import { App } from "./components/app";

debug.enable("gpp:*");

const rootElement = document.createElement("div");
rootElement.id = "root";
document.body.appendChild(rootElement);

createRoot(rootElement).render(
  <ErrorBoundary fallback={<div>Something went wrong</div>}>
    <App />
  </ErrorBoundary>,
);
