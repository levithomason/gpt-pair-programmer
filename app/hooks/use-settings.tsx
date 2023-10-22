import debug from "debug";
import * as React from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

import type {
  ServerToClientEvents,
  Settings,
  SettingsComputed,
} from "../../types";
import { socket } from "../socket.io-client";

const log = debug("gpp:app:hooks:use-settings");

const subs = [];
const subscribe = (cb: ServerToClientEvents["settingsComputed"]) => {
  subs.push(cb);
  return () => {
    const index = subs.indexOf(cb);
    if (index > -1) {
      subs.splice(index, 1);
    }
  };
};

const emit: ServerToClientEvents["settingsComputed"] = (data) => {
  log("handleSettingsUpdate", data);
  subs.forEach((cb) => cb(data));
  toast("Settings updated", { icon: <FontAwesomeIcon icon={faCog} /> });
};

socket.on("settingsComputed", emit);

const updateSettings = async (partial: Partial<Settings>) => {
  return fetch(`http://localhost:5004/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
};

export const useSettings = (): [
  settings: SettingsComputed | undefined,
  (partial: Partial<Settings>) => void,
] => {
  const [settings, setSettings] = React.useState<SettingsComputed>();

  React.useEffect(() => {
    return subscribe((data) => {
      log("handleSettings", data);
      setSettings(data);
    });
  }, []);

  return [settings, updateSettings];
};
