import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { dashboardQueryValidator } from "../validators/dashboard.validator";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get("/", dashboardQueryValidator, getDashboard);
