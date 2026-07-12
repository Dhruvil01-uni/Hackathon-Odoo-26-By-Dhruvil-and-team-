import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validate-request.middleware";

export const fuelLogIdValidator = [
  param("id").isString().notEmpty().withMessage("Fuel log id is required"),
  validateRequest,
];

export const listFuelLogsValidator = [
  query("vehicleId").optional().isString().trim().notEmpty().withMessage("Vehicle id cannot be empty"),
  query("tripId").optional().isString().trim().notEmpty().withMessage("Trip id cannot be empty"),
  validateRequest,
];

export const createFuelLogValidator = [
  body("vehicleId").isString().trim().notEmpty().withMessage("Vehicle id is required"),
  body("tripId").optional().isString().trim().notEmpty().withMessage("Trip id cannot be empty"),
  body("liters").isFloat({ gt: 0 }).withMessage("Liters must be greater than 0"),
  body("cost").isFloat({ min: 0 }).withMessage("Cost must be 0 or greater"),
  body("mileage").isFloat({ min: 0 }).withMessage("Mileage must be 0 or greater"),
  body("loggedAt").optional().isISO8601().withMessage("Fuel log date must be a valid date"),
  validateRequest,
];

export const updateFuelLogValidator = [
  param("id").isString().notEmpty().withMessage("Fuel log id is required"),
  body("tripId").optional({ nullable: true }).isString().trim().notEmpty().withMessage("Trip id cannot be empty"),
  body("liters").optional().isFloat({ gt: 0 }).withMessage("Liters must be greater than 0"),
  body("cost").optional().isFloat({ min: 0 }).withMessage("Cost must be 0 or greater"),
  body("mileage").optional().isFloat({ min: 0 }).withMessage("Mileage must be 0 or greater"),
  body("loggedAt").optional().isISO8601().withMessage("Fuel log date must be a valid date"),
  validateRequest,
];
