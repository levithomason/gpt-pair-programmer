import * as React from "react";

import { makeDebug } from "../../utils";
import { useSettings } from "../../hooks/use-settings";

const log = makeDebug("components:select-project");

export const SelectProject = () => {
  const [settings, setSettings] = useSettings();
  const [projects, setProjects] = React.useState<string[]>([]);

  const getProjects = async () => {
    const res = await fetch("http://localhost:5004/settings/projects");
    const projects = await res.json();

    log("projects", projects);

    setProjects(projects);
  };

  const handleClick = async () => {
    await getProjects();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const project = event.target.value;
    setSettings({ project });
  };

  React.useEffect(() => {
    getProjects();
  }, []);

  log("render settings", settings?.project);

  return (
    <select
      value={settings?.project}
      className="select-project"
      onClick={handleClick}
      onChange={handleChange}
    >
      {projects.map((project) => (
        <option key={project} value={project}>
          {project}
        </option>
      ))}
    </select>
  );
};
