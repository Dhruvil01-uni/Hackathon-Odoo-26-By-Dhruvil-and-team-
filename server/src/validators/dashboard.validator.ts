import { VehicleStatus } from "@prisma/client";
import { query } from "express-validator";
import { validateRequest } from "../middleware/validate-request.middleware";

const vehicleStatuses = Object.values(VehicleStatus);

export const dashboardQueryValidator = [
  query("vehicleType")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Vehicle type cannot be empty"),
  query("vehicleStatus")
    .optional()
    .isIn(vehicleStatuses)
    .withMessage("Invalid vehicle status"),
  query("region")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Region cannot be empty"),
  validateRequest,
];
