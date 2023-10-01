import express from "express";
import debug from "debug";

import type { OpenAPIMethod, OpenAPISpec } from "../types.js";
import { tools } from "../tools/index.js";
import { ToolError } from "../utils/errors.js";

const log = debug("gpp:routes:tool");

export const toolRoutes = (openAPISpec: OpenAPISpec) => {
  const router = express.Router();

  for (const [endpoint, methods] of Object.entries(openAPISpec.paths)) {
    for (const [method, details] of Object.entries(methods)) {
      const { operationId } = details;
      const requestBodyProperties =
        details.requestBody?.content?.["application/json"]?.schema
          ?.properties || {};

      //
      // Dynamically add routes for each tool
      //
      router[method as OpenAPIMethod](endpoint, async (req, res) => {
        log(method, endpoint, req.body);

        // pick the args from the request body based on the OpenAPI spec
        const args = {};
        Object.keys(requestBodyProperties).forEach((key) => {
          args[key] = req.body[key];
        });

        const tool = tools[operationId];

        if (!tool) {
          res.status(400).json({ error: `Tool ${operationId} not found.` });
          return;
        }

        try {
          log(operationId, args);
          const data = await tool(args);
          log(endpoint, data);
          res.status(200).send(data);
        } catch (error) {
          if (error instanceof ToolError) {
            res.status(400).json({ error: error.message });
          } else {
            res.status(500).json({ error: (error as Error).toString() });
          }
        }
      });
    }
  }

  return router;
};
