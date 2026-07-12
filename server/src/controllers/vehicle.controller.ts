import { VehicleStatus } from "@prisma/client";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import * as vehicleService from "../services/vehicle.service";

function getParamId(value: unknown) {
  return String(value);
}

export const listVehicles = asyncHandler(async (req, res) => {
  const filters: vehicleService.VehicleListFilters = {};

  if (typeof req.query.status === "string") {
    filters.status = req.query.status as VehicleStatus;
  }

  if (typeof req.query.type === "string") {
    filters.type = req.query.type;
  }

  if (typeof req.query.region === "string") {
    filters.region = req.query.region;
  }

  if (typeof req.query.search === "string") {
    filters.search = req.query.search;
  }

  const vehicles = await vehicleService.listVehicles({
    ...filters,
  });

  return sendSuccess(res, "Vehicles retrieved", vehicles);
});

export const listDispatchableVehicles = asyncHandler(async (req, res) => {
  const filters: Omit<vehicleService.VehicleListFilters, "status"> = {};

  if (typeof req.query.type === "string") {
    filters.type = req.query.type;
  }

  if (typeof req.query.region === "string") {
    filters.region = req.query.region;
  }

  if (typeof req.query.search === "string") {
    filters.search = req.query.search;
  }

  const vehicles = await vehicleService.listDispatchableVehicles(filters);

  return sendSuccess(res, "Dispatchable vehicles retrieved", vehicles);
});

export const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(getParamId(req.params.id));

  return sendSuccess(res, "Vehicle retrieved", vehicle);
});

export const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body);

  return sendSuccess(res, "Vehicle created", vehicle, 201);
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(getParamId(req.params.id), req.body);

  return sendSuccess(res, "Vehicle updated", vehicle);
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(getParamId(req.params.id));

  return sendSuccess(res, "Vehicle deleted", null);
});
