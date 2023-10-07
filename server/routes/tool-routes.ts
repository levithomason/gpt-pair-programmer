import express from "express";
import debug from "debug";

import type { OpenAPIMethod, OpenAPISpec } from "../../types.js";
import { tools } from "../tools/index.js";
import { ToolError } from "../utils/errors.js";
import { forEachOpenAPIPath } from "../../shared/openapi.js";
import { openAIFunctions } from "../utils/index.js";

const log = debug("gpp:routes:tool");

export const toolRoutes = (openApiJson: OpenAPISpec) => {
  const router = express.Router();

  router.get("/openapi.json", (_, res) => {
    res.json(openApiJson);
  });

  router.get("/tools", (req, res) => {
    res.json(openAIFunctions);
  });

  /**
   * Dynamically add routes for each tool.
   */
  forEachOpenAPIPath(
    openApiJson,
    ({ endpoint, method, operationId, schema }) => {
      router[method as OpenAPIMethod](endpoint, async (req, res) => {
        log(method, endpoint, req.body);

        // pick the args from the request body based on the OpenAPI spec
        const args = {};
        Object.keys(schema?.properties || {}).forEach((key) => {
          args[key] = req.body[key];
        });

        const tool = tools[operationId];

        if (!tool) {
          res.status(400).json({ error: `Tool ${operationId} not found.` });
          return;
        }

        try {
          log("calling", operationId, args);
          const data = await tool(args);
          res.status(200).send(data);
        } catch (error) {
          if (error instanceof ToolError) {
            res.status(400).json({ error: error.message });
          } else {
            res.status(500).json({ error: (error as Error).toString() });
          }
        }
      });
    },
  );

  return router;
};
