import { MaintenanceStatus } from "@prisma/client";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validate-request.middleware";

const maintenanceStatuses = Object.values(MaintenanceStatus);

export const maintenanceIdValidator = [
  param("id").isString().notEmpty().withMessage("Maintenance id is required"),
  validateRequest,
];

export const listMaintenanceValidator = [
  query("vehicleId").optional().isString().trim().notEmpty().withMessage("Vehicle id cannot be empty"),
  query("status").optional().isIn(maintenanceStatuses).withMessage("Invalid maintenance status"),
  validateRequest,
];

export const createMaintenanceValidator = [
  body("vehicleId").isString().trim().notEmpty().withMessage("Vehicle id is required"),
  body("description").isString().trim().notEmpty().withMessage("Description is required"),
  body("cost").isFloat({ min: 0 }).withMessage("Cost must be 0 or greater"),
  body("status").optional().isIn(maintenanceStatuses).withMessage("Invalid maintenance status"),
  validateRequest,
];

export const updateMaintenanceValidator = [
  param("id").isString().notEmpty().withMessage("Maintenance id is required"),
  body("description").optional().isString().trim().notEmpty().withMessage("Description cannot be empty"),
  body("cost").optional().isFloat({ min: 0 }).withMessage("Cost must be 0 or greater"),
  body("status").optional().isIn(maintenanceStatuses).withMessage("Invalid maintenance status"),
  validateRequest,
];
