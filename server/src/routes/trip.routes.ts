import { Router } from "express";
import { USER_ROLES } from "../constants/roles";
import * as tripController from "../controllers/trip.controller";
import { authenticate, requireRoles } from "../middleware/auth.middleware";
import {
  completeTripValidator,
  createTripValidator,
  listTripsValidator,
  tripIdValidator,
  updateTripValidator,
} from "../validators/trip.validator";

export const tripRouter = Router();

tripRouter.use(authenticate);

tripRouter.get(
  "/",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.DRIVER, USER_ROLES.SAFETY_OFFICER),
  listTripsValidator,
  tripController.listTrips
);
tripRouter.get(
  "/:id",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.DRIVER, USER_ROLES.SAFETY_OFFICER),
  tripIdValidator,
  tripController.getTrip
);
tripRouter.post(
  "/",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.DRIVER),
  createTripValidator,
  tripController.createTrip
);
tripRouter.put(
  "/:id",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.DRIVER),
  updateTripValidator,
  tripController.updateTrip
);
tripRouter.post(
  "/:id/dispatch",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.DRIVER),
  tripIdValidator,
  tripController.dispatchTrip
);
tripRouter.post(
  "/:id/complete",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.DRIVER),
  completeTripValidator,
  tripController.completeTrip
);
tripRouter.post(
  "/:id/cancel",
  requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.DRIVER),
  tripIdValidator,
  tripController.cancelTrip
);
tripRouter.delete(
  "/:id",
  requireRoles(USER_ROLES.FLEET_MANAGER),
  tripIdValidator,
  tripController.deleteTrip
);
