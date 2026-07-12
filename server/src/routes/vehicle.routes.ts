import { Router } from "express";
import { USER_ROLES } from "../constants/roles";
import * as vehicleController from "../controllers/vehicle.controller";
import { authenticate, requireRoles } from "../middleware/auth.middleware";
import {
  createVehicleValidator,
  listVehiclesValidator,
  updateVehicleValidator,
  vehicleIdValidator,
} from "../validators/vehicle.validator";

export const vehicleRouter = Router();

vehicleRouter.use(authenticate);

vehicleRouter.get("/", listVehiclesValidator, vehicleController.listVehicles);
vehicleRouter.get("/dispatchable", listVehiclesValidator, vehicleController.listDispatchableVehicles);
vehicleRouter.get("/:id", vehicleIdValidator, vehicleController.getVehicle);
vehicleRouter.post(
  "/",
  requireRoles(USER_ROLES.FLEET_MANAGER),
  createVehicleValidator,
  vehicleController.createVehicle
);
vehicleRouter.put(
  "/:id",
  requireRoles(USER_ROLES.FLEET_MANAGER),
  updateVehicleValidator,
  vehicleController.updateVehicle
);
vehicleRouter.delete(
  "/:id",
  requireRoles(USER_ROLES.FLEET_MANAGER),
  vehicleIdValidator,
  vehicleController.deleteVehicle
);
