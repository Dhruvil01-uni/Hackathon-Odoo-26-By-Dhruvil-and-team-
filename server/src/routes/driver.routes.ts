import { Router } from "express";
import { USER_ROLES } from "../constants/roles";
import * as driverController from "../controllers/driver.controller";
import { authenticate, requireRoles } from "../middleware/auth.middleware";
import {
  createDriverValidator,
  driverIdValidator,
  listDriversValidator,
  updateDriverValidator,
} from "../validators/driver.validator";

export const driverRouter = Router();

driverRouter.use(authenticate);

driverRouter.get(
  "/",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.SAFETY_OFFICER),
  listDriversValidator,
  driverController.listDrivers
);
driverRouter.get(
  "/dispatchable",
  listDriversValidator,
  driverController.listDispatchableDrivers
);
driverRouter.get(
  "/:id",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.SAFETY_OFFICER),
  driverIdValidator,
  driverController.getDriver
);
driverRouter.post(
  "/",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.SAFETY_OFFICER),
  createDriverValidator,
  driverController.createDriver
);
driverRouter.put(
  "/:id",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.SAFETY_OFFICER),
  updateDriverValidator,
  driverController.updateDriver
);
driverRouter.delete(
  "/:id",
  requireRoles(USER_ROLES.FLEET_MANAGER),
  driverIdValidator,
  driverController.deleteDriver
);
