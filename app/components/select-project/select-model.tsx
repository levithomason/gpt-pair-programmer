import * as React from "react";

import type { OpenAIModel, SupportedOpenAIModel } from "../../../types";
import { makeDebug } from "../../utils";
import { useIsFirstRender } from "../../hooks/use-first-render";
import { useSettings } from "../../hooks/use-settings";

const log = makeDebug("components:select-model");

export const SelectModel = () => {
  const isFirstRender = useIsFirstRender();
  const [settings, setSettings] = useSettings();
  const [models, setModels] = React.useState<OpenAIModel[]>([]);

  const getModels = async () => {
    const modelsRes = await fetch("http://localhost:5004/settings/models");
    const models = await modelsRes.json();

    log("models", models);

    setModels(models);
  };

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const model = event.target.value as SupportedOpenAIModel;
    setSettings({ modelName: model });
  };

  React.useEffect(() => {
    if (isFirstRender) {
      getModels();
    }
  }, []);

  log("render settings", settings?.modelName);

  return (
    <select
      value={settings?.modelName}
      className="select-model"
      onChange={handleChange}
    >
      {models.map((model) => (
        <option key={model.name} value={model.name}>
          {model.name}
        </option>
      ))}
    </select>
  );
};
