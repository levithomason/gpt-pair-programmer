import * as React from "react";

import "./tools.css";

import type { OpenAIFunction } from "../../../types";
import { classNames, makeDebug } from "../../utils";
import { useIsFirstRender } from "../../hooks/use-first-render";

const log = makeDebug("gpp:app:components:tools");

export const Tools = () => {
  const [tools, setTools] = React.useState<OpenAIFunction[]>([]);
  const [error, setError] = React.useState<string>("");

  const isFirstRender = useIsFirstRender();

  React.useEffect(() => {
    if (!isFirstRender) return;

    fetch(`http://localhost:5004/tools`)
      .then((res) => res.json())
      .then((res) => {
        log("fetched tools", res);
        setTools(res);
      })
      .catch((err) => {
        log(err);
        setError(err.toString());
      });
  });

  log("render", { tools });

  return (
    <div id="tools">
      <h3 className="tools_header">
        <i className="fa fa-microchip"></i>&nbsp;Tools
      </h3>
      <div className="tool-list">
        {tools.map((tool: OpenAIFunction, index) => (
          <div key={index} className="tool">
            <div className="tool__name">{tool.name}</div>
            <button className="tool__button">Run</button>
            {tool.description && (
              <div className="tool__description">{tool.description}</div>
            )}
            {Object.keys(tool.parameters.properties).length > 0 && (
              <div className="tool__args">
                {Object.entries(tool.parameters.properties).map(
                  ([arg, argDetails]) => {
                    const required = tool.parameters.required.includes(arg);

                    return (
                      <div key={arg} className="tool__arg">
                        <div className="tool__arg-field">
                          <input
                            className="tool__arg-input"
                            type="text"
                            placeholder={arg}
                          />
                          {required && (
                            <div className="tool__arg-required">*</div>
                          )}
                          {argDetails.description && (
                            <div className="tool__arg-description">
                              {argDetails.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
