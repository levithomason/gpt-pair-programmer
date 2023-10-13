import debug from "debug";
import * as fs from "fs";

import type { OpenAIFunction } from "../../types.js";
import { forEachOpenAPIPath } from "../../shared/openapi.js";
import { openApiJson } from "./openapi-loader.js";
import { absPath } from "../config.js";
import { countTokens } from "./tokens.js";

const log = debug("gpp:utils:openai-functions");

export const openAIFunctions: OpenAIFunction[] = [];

forEachOpenAPIPath(openApiJson, ({ operationId, description, schema }) => {
  const parameters = schema || { type: "object", properties: {} };

  log("define", operationId);

  openAIFunctions.push({ name: operationId, description, parameters });
});

//
// AI Plugin Prompt
// Creates a prompt similar to what ChatGPT uses for plugins
//
const aiJson = fs.readFileSync(
  absPath("server/.well-known/ai-plugin.json"),
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
            const required = func.parameters.required?.includes(key) ? "" : "?";

            return `    // ${description}\n    ${key}${required}: ${type}`;
          });

          typedProperties = "_: {\n" + argLines.join("\n") + "\n  }";
        }

        const description = func.description
          ? `\n  // ${func.description.split("\n").join("\n  // ")}`
          : "";

        return `${description}\n  type ${func.name} = (${typedProperties}) => any;`;
      })
      .join("\n"),
  `} // ${aiJsonObj.name_for_model}`,
].join("\n");
