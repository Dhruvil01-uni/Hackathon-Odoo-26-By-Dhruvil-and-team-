import { VehicleStatus } from "@prisma/client";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validate-request.middleware";

const vehicleStatuses = Object.values(VehicleStatus);

export const vehicleIdValidator = [
  param("id").isString().notEmpty().withMessage("Vehicle id is required"),
  validateRequest,
];

export const listVehiclesValidator = [
  query("status").optional().isIn(vehicleStatuses).withMessage("Invalid vehicle status"),
  query("type").optional().isString().trim().notEmpty().withMessage("Vehicle type cannot be empty"),
  query("region").optional().isString().trim().notEmpty().withMessage("Region cannot be empty"),
  query("search").optional().isString().trim(),
  validateRequest,
];

export const createVehicleValidator = [
  body("registration").isString().trim().notEmpty().withMessage("Registration number is required"),
  body("name").isString().trim().notEmpty().withMessage("Vehicle name/model is required"),
  body("type").isString().trim().notEmpty().withMessage("Vehicle type is required"),
  body("region").isString().trim().notEmpty().withMessage("Region is required"),
  body("capacity").isFloat({ gt: 0 }).withMessage("Maximum load capacity must be greater than 0"),
  body("odometer").isFloat({ min: 0 }).withMessage("Odometer must be 0 or greater"),
  body("purchaseCost").isFloat({ min: 0 }).withMessage("Acquisition cost must be 0 or greater"),
  body("status").optional().isIn(vehicleStatuses).withMessage("Invalid vehicle status"),
  validateRequest,
];

export const updateVehicleValidator = [
  param("id").isString().notEmpty().withMessage("Vehicle id is required"),
  body("registration").optional().isString().trim().notEmpty().withMessage("Registration number cannot be empty"),
  body("name").optional().isString().trim().notEmpty().withMessage("Vehicle name/model cannot be empty"),
  body("type").optional().isString().trim().notEmpty().withMessage("Vehicle type cannot be empty"),
  body("region").optional().isString().trim().notEmpty().withMessage("Region cannot be empty"),
  body("capacity").optional().isFloat({ gt: 0 }).withMessage("Maximum load capacity must be greater than 0"),
  body("odometer").optional().isFloat({ min: 0 }).withMessage("Odometer must be 0 or greater"),
  body("purchaseCost").optional().isFloat({ min: 0 }).withMessage("Acquisition cost must be 0 or greater"),
  body("status").optional().isIn(vehicleStatuses).withMessage("Invalid vehicle status"),
  validateRequest,
];
