import type { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../utils/app-error";

export const validateRequest: RequestHandler = (req, _res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return next(new AppError("Validation failed", 400, result.array()));
  }

  return next();
};
