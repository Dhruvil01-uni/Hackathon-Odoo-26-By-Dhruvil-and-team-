import { Router } from "express";
import { USER_ROLES } from "../constants/roles";
import * as reportController from "../controllers/report.controller";
import { authenticate, requireRoles } from "../middleware/auth.middleware";
import { reportQueryValidator } from "../validators/report.validator";

export const reportRouter = Router();

reportRouter.use(authenticate);
reportRouter.use(requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.FINANCIAL_ANALYST));

reportRouter.get("/", reportQueryValidator, reportController.getReports);
reportRouter.get("/export.csv", reportQueryValidator, reportController.exportReportsCsv);
