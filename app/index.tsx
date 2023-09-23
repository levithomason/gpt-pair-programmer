import { createRoot } from "react-dom/client";
import * as React from "react";

import { App } from "./components/App";

const rootEl = document.createElement("div");
rootEl.id = "root";
document.body.appendChild(rootEl);

const root = createRoot(rootEl);
root.render(<App />);
