import debug from "debug";
import * as fs from "fs";
import path from "path";

import type { OpenAIFunction } from "../../shared/types.js";
import { forEachOpenAPIPath } from "../../shared/openapi.js";
import { openApiJson } from "./openapi-loader.js";
import { SERVER_ROOT } from "../paths.js";

const log = debug("gpp:utils:openai-functions");

export const openAIFunctions: OpenAIFunction[] = [];

forEachOpenAPIPath(openApiJson, ({ operationId, description, schema }) => {
  const parameters = schema || { type: "object", properties: {} };

  log("define", operationId);

  openAIFunctions.push({
    name: operationId,
    description: description.trim(),
    parameters,
  });
});

//
// AI Plugin Prompt
// Creates a prompt similar to what ChatGPT uses for plugins
//
const aiJson = fs.readFileSync(
  path.join(SERVER_ROOT, ".well-known", "ai-plugin.json"),
  "utf-8",
);
const aiJsonObj = JSON.parse(aiJson);
export const chatGPTFunctionsPrompt = [
  `// ${aiJsonObj.description_for_model}`,
  `namespace ${aiJsonObj.name_for_model} {` +
    openAIFunctions
      .map((func) => {
        const propertyKeys = Object.keys(func.parameters.properties);
        let typedProperties = "";

        if (propertyKeys.length) {
          const argLines = propertyKeys.map((key) => {
            const { type, description } = func.parameters.properties[key];
            const optional = func.parameters.required?.includes(key) ? "" : "?";

            return `    // ${description.trim()}\n    ${key}${optional}: ${type}`;
          });

          typedProperties = "_: {\n" + argLines.join("\n") + "\n  }";
        }

        const description = func.description
          ? `\n${func.description
              .trim()
              .split("\n")
              .map((l) => "  // " + l.trim())
              .join("\n")}`
          : "";

        return `${description}\n  type ${func.name} = (${typedProperties}) => any;`;
      })
      .join("\n"),
  `} // ${aiJsonObj.name_for_model}`,
].join("\n");
