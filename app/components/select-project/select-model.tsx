import * as React from "react";

import type { SupportedLLMName } from "../../../shared/types.js";
import { makeDebug } from "../../utils";
import { useSettings } from "../../hooks/use-settings";

const log = makeDebug("components:select-model");

export const SelectModel = () => {
  const [settings, setSettings] = useSettings();

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    log("handleChange", event.target.value);
    const model = event.target.value as SupportedLLMName;
    setSettings({ modelName: model });
  };

  log(`render`, settings);

  return (
    <select
      value={settings?.model.name}
      className="select-model"
      onChange={handleChange}
    >
      {settings?.models.map((model) => (
        <option key={model.name} value={model.name}>
          {model.name}
        </option>
      ))}
    </select>
  );
};
