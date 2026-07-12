import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { loginValidator } from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/login", loginValidator, authController.login);
authRouter.get("/me", authenticate, authController.me);
authRouter.post("/logout", authenticate, authController.logout);
