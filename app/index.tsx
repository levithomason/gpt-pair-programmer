import debug from "debug";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import "./index.css";
// TODO: split server and app package.json and tsconfig
//       app doesn't need
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
