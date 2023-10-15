import * as React from "react";

import { makeDebug } from "../../utils";
import { useSettings } from "../../hooks/use-settings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-regular-svg-icons";

const log = makeDebug("components:select-project");

export const SelectProject = () => {
  const [settings, setSettings] = useSettings();

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    log("handleChange", event.target.value);
    const project = event.target.value;
    setSettings({ projectName: project });
  };

  log(`render`, settings);

  return (
    <select
      value={settings?.settings.projectName}
      className="select-project"
      onChange={handleChange}
    >
      {settings?.projects.map((project) => (
        <option key={project} value={project}>
          {project}
        </option>
      ))}
    </select>
  );
};
