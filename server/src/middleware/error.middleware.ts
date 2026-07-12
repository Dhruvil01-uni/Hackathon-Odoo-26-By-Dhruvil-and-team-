import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-error";
import { sendError } from "../utils/api-response";
import { env } from "../config/env";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode, error.errors);
  }

  const errors = env.nodeEnv === "production" ? undefined : error;

  return sendError(res, "Internal server error", 500, errors);
};
