import debug from "debug";
import * as React from "react";

import type { Settings, SettingsComputed } from "../../types";
import { socket } from "../socket.io-client";

const log = debug("gpp:app:hooks:use-settings");

export const useSettings = (): [
  settings: SettingsComputed | undefined,
  (partial: Partial<Settings>) => void,
] => {
  const [settings, setSettings] = React.useState<SettingsComputed>();

  const updateSettings = async (partial: Partial<Settings>) => {
    return fetch(`http://localhost:5004/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
  };

  React.useEffect(() => {
    const handleSettingsUpdate = (data: SettingsComputed) => {
      log("handleSettingsUpdate", data);
      setSettings(data);
    };

    socket.on("settingsComputed", handleSettingsUpdate);

    return () => {
      socket.off("settingsComputed", handleSettingsUpdate);
    };
  }, []);

  return [settings, updateSettings];
};
