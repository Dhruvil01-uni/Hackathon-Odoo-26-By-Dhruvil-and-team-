import { Router } from "express";
import { USER_ROLES } from "../constants/roles";
import * as maintenanceController from "../controllers/maintenance.controller";
import { authenticate, requireRoles } from "../middleware/auth.middleware";
import {
  createMaintenanceValidator,
  listMaintenanceValidator,
  maintenanceIdValidator,
  updateMaintenanceValidator,
} from "../validators/maintenance.validator";

export const maintenanceRouter = Router();

maintenanceRouter.use(authenticate);
maintenanceRouter.use(requireRoles(USER_ROLES.FLEET_MANAGER));

maintenanceRouter.get("/", listMaintenanceValidator, maintenanceController.listMaintenance);
maintenanceRouter.get("/:id", maintenanceIdValidator, maintenanceController.getMaintenance);
maintenanceRouter.post("/", createMaintenanceValidator, maintenanceController.createMaintenance);
maintenanceRouter.put("/:id", updateMaintenanceValidator, maintenanceController.updateMaintenance);
maintenanceRouter.post(
  "/:id/complete",
  maintenanceIdValidator,
  maintenanceController.completeMaintenance
);
maintenanceRouter.delete(
  "/:id",
  maintenanceIdValidator,
  maintenanceController.deleteMaintenance
);
