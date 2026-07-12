import { DriverStatus } from "@prisma/client";
import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validate-request.middleware";

const driverStatuses = Object.values(DriverStatus);

export const driverIdValidator = [
  param("id").isString().notEmpty().withMessage("Driver id is required"),
  validateRequest,
];

export const listDriversValidator = [
  query("status").optional().isIn(driverStatuses).withMessage("Invalid driver status"),
  query("search").optional().isString().trim(),
  query("licenseExpiringBefore")
    .optional()
    .isISO8601()
    .withMessage("licenseExpiringBefore must be a valid date"),
  validateRequest,
];

export const createDriverValidator = [
  body("name").isString().trim().notEmpty().withMessage("Driver name is required"),
  body("phone").isString().trim().notEmpty().withMessage("Contact number is required"),
  body("licenseNumber").isString().trim().notEmpty().withMessage("License number is required"),
  body("licenseCategory").isString().trim().notEmpty().withMessage("License category is required"),
  body("expiryDate").isISO8601().withMessage("License expiry date must be a valid date"),
  body("safetyScore").isFloat({ min: 0, max: 100 }).withMessage("Safety score must be between 0 and 100"),
  body("status").optional().isIn(driverStatuses).withMessage("Invalid driver status"),
  validateRequest,
];

export const updateDriverValidator = [
  param("id").isString().notEmpty().withMessage("Driver id is required"),
  body("name").optional().isString().trim().notEmpty().withMessage("Driver name cannot be empty"),
  body("phone").optional().isString().trim().notEmpty().withMessage("Contact number cannot be empty"),
  body("licenseNumber").optional().isString().trim().notEmpty().withMessage("License number cannot be empty"),
  body("licenseCategory").optional().isString().trim().notEmpty().withMessage("License category cannot be empty"),
  body("expiryDate").optional().isISO8601().withMessage("License expiry date must be a valid date"),
  body("safetyScore").optional().isFloat({ min: 0, max: 100 }).withMessage("Safety score must be between 0 and 100"),
  body("status").optional().isIn(driverStatuses).withMessage("Invalid driver status"),
  validateRequest,
];
