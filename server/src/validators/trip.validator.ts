import { TripStatus } from "@prisma/client";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validate-request.middleware";

const tripStatuses = Object.values(TripStatus);

export const tripIdValidator = [
  param("id").isString().notEmpty().withMessage("Trip id is required"),
  validateRequest,
];

export const listTripsValidator = [
  query("status").optional().isIn(tripStatuses).withMessage("Invalid trip status"),
  query("vehicleId").optional().isString().trim().notEmpty().withMessage("Vehicle id cannot be empty"),
  query("driverId").optional().isString().trim().notEmpty().withMessage("Driver id cannot be empty"),
  validateRequest,
];

export const createTripValidator = [
  body("vehicleId").isString().trim().notEmpty().withMessage("Vehicle id is required"),
  body("driverId").isString().trim().notEmpty().withMessage("Driver id is required"),
  body("source").isString().trim().notEmpty().withMessage("Source is required"),
  body("destination").isString().trim().notEmpty().withMessage("Destination is required"),
  body("cargoWeight").isFloat({ gt: 0 }).withMessage("Cargo weight must be greater than 0"),
  body("distance").isFloat({ gt: 0 }).withMessage("Planned distance must be greater than 0"),
  body("revenue").optional().isFloat({ min: 0 }).withMessage("Revenue must be 0 or greater"),
  validateRequest,
];

export const updateTripValidator = [
  param("id").isString().notEmpty().withMessage("Trip id is required"),
  body("vehicleId").optional().isString().trim().notEmpty().withMessage("Vehicle id cannot be empty"),
  body("driverId").optional().isString().trim().notEmpty().withMessage("Driver id cannot be empty"),
  body("source").optional().isString().trim().notEmpty().withMessage("Source cannot be empty"),
  body("destination").optional().isString().trim().notEmpty().withMessage("Destination cannot be empty"),
  body("cargoWeight").optional().isFloat({ gt: 0 }).withMessage("Cargo weight must be greater than 0"),
  body("distance").optional().isFloat({ gt: 0 }).withMessage("Planned distance must be greater than 0"),
  body("revenue").optional().isFloat({ min: 0 }).withMessage("Revenue must be 0 or greater"),
  validateRequest,
];

export const completeTripValidator = [
  param("id").isString().notEmpty().withMessage("Trip id is required"),
  body("finalOdometer").optional().isFloat({ min: 0 }).withMessage("Final odometer must be 0 or greater"),
  body("fuelConsumed").optional().isFloat({ gt: 0 }).withMessage("Fuel consumed must be greater than 0"),
  body("revenue").optional().isFloat({ min: 0 }).withMessage("Revenue must be 0 or greater"),
  validateRequest,
];
