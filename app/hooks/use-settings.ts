import debug from "debug";
import * as React from "react";

import type { Settings } from "../../types";
import { socket } from "../socket.io-client";
import { useIsFirstRender } from "./use-first-render";

const log = debug("gpp:app:hooks:use-settings");

export const useSettings = (): [
  settings: Settings,
  (partial: Partial<Settings>) => void,
] => {
  const [settings, setSettings] = React.useState<Settings>();
  const isFirstRender = useIsFirstRender();

  const fetchSettings = async () => {
    const res = await fetch(`http://localhost:5004/settings`);
    const json = await res.json();

    setSettings((prevSettings) => ({
      ...prevSettings,
      ...json,
    }));
  };

  const updateSettings = (partial: Partial<Settings>) => {
    fetch(`http://localhost:5004/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
  };

  React.useEffect(() => {
    if (isFirstRender) {
      log("fetchSettings on mount");
      fetchSettings();
    }

    const handleSettingsUpdate = (data: Settings) => {
      log("handleSettingsUpdate", data);
      setSettings(data);
    };

    socket.on("settingsUpdate", handleSettingsUpdate);

    return () => {
      socket.off("settingsUpdate", handleSettingsUpdate);
    };
  }, [isFirstRender]);

  return [settings, updateSettings];
};
