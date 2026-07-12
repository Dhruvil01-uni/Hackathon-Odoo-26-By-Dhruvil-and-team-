import { query } from "express-validator";
import { validateRequest } from "../middleware/validate-request.middleware";

export const reportQueryValidator = [
  query("vehicleId")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Vehicle id cannot be empty"),
  query("region")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Region cannot be empty"),
  query("vehicleType")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Vehicle type cannot be empty"),
  validateRequest,
];
