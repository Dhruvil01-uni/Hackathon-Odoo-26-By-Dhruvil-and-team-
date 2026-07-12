import { body } from "express-validator";
import { validateRequest } from "../middleware/validate-request.middleware";

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  validateRequest,
];
