import type { ErrorRequestHandler } from "express";
import { log } from "../utils/index.js";

// ============================================================================
// Middleware
// ============================================================================

// errors
export const logErrors: ErrorRequestHandler = (err, req, res, next) => {
  log("logErrors", err.message);
  next(err);
};

export const returnErrors: ErrorRequestHandler = (err, req, res, next) => {
  log("returnErrors", err.message);
  res.status(err.statusCode || 500).send({ error: err.message });
};
