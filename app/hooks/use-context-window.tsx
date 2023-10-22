import debug from "debug";
import * as React from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand } from "@fortawesome/free-solid-svg-icons";

import type { DataForEvent, ServerToClientEvents } from "../../types";
import { socket } from "../socket.io-client";

const log = debug("gpp:app:hooks:use-context-window");

const subs = [];
const subscribe = (cb: ServerToClientEvents["contextWindow"]) => {
  subs.push(cb);
  return () => {
    const index = subs.indexOf(cb);
    if (index > -1) {
      subs.splice(index, 1);
    }
  };
};

const emit: ServerToClientEvents["contextWindow"] = (data) => {
  log("handleContextWindowUpdate", data);
  subs.forEach((cb) => cb(data));
  toast("Context window updated", {
    icon: <FontAwesomeIcon icon={faExpand} />,
  });
};

socket.on("contextWindow", emit);

export const useContextWindow = (): [
  contextWindow: DataForEvent<"contextWindow">,
] => {
  const [contextWindow, setContextWindow] = React.useState<
    DataForEvent<"contextWindow">
  >({ messages: [], tokens: null });

  React.useEffect(() => {
    return subscribe((data: DataForEvent<"contextWindow">) => {
      log("handleContextWindow", data);
      setContextWindow(data);
    });
  }, []);

  return [contextWindow];
};
