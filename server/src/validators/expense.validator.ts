import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validate-request.middleware";

export const expenseIdValidator = [
  param("id").isString().notEmpty().withMessage("Expense id is required"),
  validateRequest,
];

export const listExpensesValidator = [
  query("vehicleId").optional().isString().trim().notEmpty().withMessage("Vehicle id cannot be empty"),
  query("category").optional().isString().trim().notEmpty().withMessage("Category cannot be empty"),
  validateRequest,
];

export const createExpenseValidator = [
  body("vehicleId").isString().trim().notEmpty().withMessage("Vehicle id is required"),
  body("category").isString().trim().notEmpty().withMessage("Category is required"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be 0 or greater"),
  body("notes").optional().isString().trim(),
  body("expenseDate").optional().isISO8601().withMessage("Expense date must be a valid date"),
  validateRequest,
];

export const updateExpenseValidator = [
  param("id").isString().notEmpty().withMessage("Expense id is required"),
  body("category").optional().isString().trim().notEmpty().withMessage("Category cannot be empty"),
  body("amount").optional().isFloat({ min: 0 }).withMessage("Amount must be 0 or greater"),
  body("notes").optional({ nullable: true }).isString().trim(),
  body("expenseDate").optional().isISO8601().withMessage("Expense date must be a valid date"),
  validateRequest,
];
