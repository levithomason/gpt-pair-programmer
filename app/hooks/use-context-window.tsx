import debug from "debug";
import * as React from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand } from "@fortawesome/free-solid-svg-icons";

import type { DataForEvent, ServerToClientEvents } from "../../shared/types.js";
import { socket } from "../socket.io-client";

const log = debug("gpp:app:hooks:use-context-window");

const subscriptions = [];
const subscribe = (cb: ServerToClientEvents["contextWindowUpdate"]) => {
  subscriptions.push(cb);
  return () => {
    const index = subscriptions.indexOf(cb);
    if (index > -1) {
      subscriptions.splice(index, 1);
    }
  };
};

const emit: ServerToClientEvents["contextWindowUpdate"] = (data) => {
  log("handleContextWindowUpdate", data);
  subscriptions.forEach((cb) => cb(data));
  toast("Context window updated", {
    icon: <FontAwesomeIcon icon={faExpand} />,
  });
};

socket.on("contextWindowUpdate", emit);

export const useContextWindow = (): [
  contextWindow: DataForEvent<"contextWindowUpdate">,
] => {
  const [contextWindow, setContextWindow] = React.useState<
    DataForEvent<"contextWindowUpdate">
  >({ messages: [], tokens: null });

  React.useEffect(() => {
    return subscribe((data: DataForEvent<"contextWindowUpdate">) => {
      log("handleContextWindow", data);
      setContextWindow(data);
    });
  }, []);

  return [contextWindow];
};
