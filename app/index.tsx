import * as React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import "./index.css";
// TODO: split server and app package.json and tsconfig
//       app doesn't need
import { App } from "./components/app";

const rootElement = document.createElement("div");
rootElement.id = "root";
document.body.appendChild(rootElement);

const fontAwesomeScript = document.createElement("script");
fontAwesomeScript.src = "https://kit.fontawesome.com/793ccf0739.js";
fontAwesomeScript.crossOrigin = "anonymous";
document.body.appendChild(fontAwesomeScript);

createRoot(rootElement).render(
  <ErrorBoundary fallback={<div>Something went wrong</div>}>
    <App />
  </ErrorBoundary>,
);
