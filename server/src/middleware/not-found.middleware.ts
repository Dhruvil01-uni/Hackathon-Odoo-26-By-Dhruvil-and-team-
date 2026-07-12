import type { RequestHandler } from "express";
import { sendError } from "../utils/api-response";

export const notFoundMiddleware: RequestHandler = (req, res) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
};
