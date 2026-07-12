import { Router } from "express";
import { USER_ROLES } from "../constants/roles";
import * as fuelController from "../controllers/fuel.controller";
import { authenticate, requireRoles } from "../middleware/auth.middleware";
import {
  createFuelLogValidator,
  fuelLogIdValidator,
  listFuelLogsValidator,
  updateFuelLogValidator,
} from "../validators/fuel.validator";

export const fuelRouter = Router();

fuelRouter.use(authenticate);
fuelRouter.use(requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.FINANCIAL_ANALYST));

fuelRouter.get("/", listFuelLogsValidator, fuelController.listFuelLogs);
fuelRouter.get("/:id", fuelLogIdValidator, fuelController.getFuelLog);
fuelRouter.post("/", createFuelLogValidator, fuelController.createFuelLog);
fuelRouter.put("/:id", updateFuelLogValidator, fuelController.updateFuelLog);
fuelRouter.delete("/:id", fuelLogIdValidator, fuelController.deleteFuelLog);
