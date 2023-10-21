import debug from "debug";
import * as React from "react";

import type { Settings, SettingsComputed } from "../../types";
import { socket } from "../socket.io-client";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

const log = debug("gpp:app:hooks:use-settings");

type Subscription = (data: SettingsComputed) => void;

const subs = [];
const sub = (cb: Subscription) => {
  subs.push(cb);
  return () => {
    const index = subs.indexOf(cb);
    if (index > -1) {
      subs.splice(index, 1);
    }
  };
};

const emit = (data: SettingsComputed) => {
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

  const handleSettings = React.useCallback((data: SettingsComputed) => {
    log("handleSettings", data);
    setSettings(data);
  }, []);

  React.useEffect(() => {
    return sub(handleSettings);
  }, [handleSettings]);

  return [settings, updateSettings];
};
