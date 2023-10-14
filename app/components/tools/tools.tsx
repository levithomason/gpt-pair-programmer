import * as React from "react";

import "./tools.css";

import type { OpenAPISpec, ToolAttributes } from "../../../types";
import { makeDebug, queryString } from "../../utils";
import { useIsFirstRender } from "../../hooks/use-first-render";
import { forEachOpenAPIPath } from "../../../shared/openapi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

const log = makeDebug("components:tools");

export const Tools = () => {
  const [tools, setTools] = React.useState<ToolAttributes[]>([]);
  const [loadingByTool, setLoadingByTool] = React.useState<
    Record<ToolAttributes["operationId"], boolean>
  >({});

  // TODO: this typing could be improved if it knew the attributes of the specific tool
  const [argsByTool, setArgsByTool] = React.useState<
    Record<ToolAttributes["operationId"], any>
  >({});

  const isFirstRender = useIsFirstRender();

  React.useEffect(() => {
    if (!isFirstRender) return;

    fetch(`http://localhost:5004/openapi.json`)
      .then((res) => res.json())
      .then((openApiJson: OpenAPISpec) => {
        const tools = [];
        forEachOpenAPIPath(openApiJson, (tool: ToolAttributes) => {
          tools.push(tool);
        });
        setTools(tools);
        log("fetched openapi JSON", openApiJson);
      });
  });

  // TODO: Should there be a single entry point to calling tools?
  //       Tools need to result in adding messages to the message stack.
  //       A tool might not need to add a message to context in some cases.
  //       An example could be when chaining toolB(toolA()).
  const callTool = React.useCallback(
    async (tool: ToolAttributes) => {
      const args = argsByTool[tool.operationId];

      const method = tool.method.toUpperCase();
      const host = `http://localhost:5004`;

      const search = method === "GET" ? queryString(args) : "";
      const headers =
        method === "GET"
          ? undefined
          : {
              "Content-Type": "application/json",
            };
      const body = method === "GET" ? undefined : JSON.stringify(args);

      const url = `${host}${tool.endpoint}${search}`;
      const options = { method, headers, body };
      log("callTool", host, options);

      try {
        setLoadingByTool({ ...loadingByTool, [tool.operationId]: true });
        await fetch(url, options);
        setLoadingByTool({ ...loadingByTool, [tool.operationId]: false });
      } catch (error) {
        setLoadingByTool({ ...loadingByTool, [tool.operationId]: false });
      }
    },
    [argsByTool],
  );

  log("render", { tools });

  return (
    <div id="tools">
      <h3 className="tools_header">
        <FontAwesomeIcon icon={faCode} />
        &nbsp;Tools
      </h3>
      <div className="tool-list">
        {tools.map((tool: ToolAttributes) => (
          <form
            key={tool.operationId}
            className="tool"
            onSubmit={(e) => {
              e.preventDefault();
              setLoadingByTool({ ...loadingByTool, [tool.operationId]: true });
              callTool(tool);
            }}
          >
            <div className="tool__name">{tool.operationId}</div>
            <div className="tool__controls">
              {loadingByTool[tool.operationId] ? (
                <FontAwesomeIcon
                  className="tool__loading-icon"
                  icon={faCode}
                  fade
                />
              ) : (
                <button
                  type="submit"
                  className="tool__button"
                  disabled={loadingByTool[tool.operationId]}
                >
                  Run
                </button>
              )}
            </div>
            {tool.description && (
              <div className="tool__description">{tool.description}</div>
            )}
            {tool.schema?.properties &&
              Object.keys(tool.schema.properties).length > 0 && (
                <div className="tool__args">
                  {Object.entries(tool.schema.properties).map(
                    ([arg, argDetails]) => {
                      const isArgRequired = tool.schema.required?.includes(arg);

                      const inputType = {
                        string: "text",
                        integer: "number",
                        boolean: "checkbox",
                        array: "textarea",
                      }[argDetails.type];

                      if (!inputType) {
                        // TODO: add client error types and handling
                        throw new Error(
                          `Unhandled arg type ${argDetails.type}.`,
                        );
                      }

                      return (
                        <div key={arg} className="tool__arg">
                          <div className="tool__arg-field">
                            <input
                              className="tool__arg-input"
                              type={inputType}
                              placeholder={arg}
                              required={isArgRequired}
                              onChange={(e) => {
                                log("arg changed", e.target.value);
                                setArgsByTool({
                                  ...argsByTool,
                                  [tool.operationId]: {
                                    ...argsByTool[tool.operationId],
                                    [arg]: e.target.value,
                                  },
                                });
                              }}
                            />
                            {isArgRequired && (
                              <div className="tool__arg-required">*</div>
                            )}
                            {argDetails && (
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
          </form>
        ))}
      </div>
    </div>
  );
};
