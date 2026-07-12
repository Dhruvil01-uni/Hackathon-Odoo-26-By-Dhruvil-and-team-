import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import * as fuelService from "../services/fuel.service";

function getParamId(value: unknown) {
  return String(value);
}

export const listFuelLogs = asyncHandler(async (req, res) => {
  const filters: fuelService.FuelLogListFilters = {};

  if (typeof req.query.vehicleId === "string") {
    filters.vehicleId = req.query.vehicleId;
  }

  if (typeof req.query.tripId === "string") {
    filters.tripId = req.query.tripId;
  }

  const fuelLogs = await fuelService.listFuelLogs(filters);

  return sendSuccess(res, "Fuel logs retrieved", fuelLogs);
});

export const getFuelLog = asyncHandler(async (req, res) => {
  const fuelLog = await fuelService.getFuelLogById(getParamId(req.params.id));

  return sendSuccess(res, "Fuel log retrieved", fuelLog);
});

export const createFuelLog = asyncHandler(async (req, res) => {
  const fuelLog = await fuelService.createFuelLog(req.body);

  return sendSuccess(res, "Fuel log created", fuelLog, 201);
});

export const updateFuelLog = asyncHandler(async (req, res) => {
  const fuelLog = await fuelService.updateFuelLog(getParamId(req.params.id), req.body);

  return sendSuccess(res, "Fuel log updated", fuelLog);
});

export const deleteFuelLog = asyncHandler(async (req, res) => {
  await fuelService.deleteFuelLog(getParamId(req.params.id));

  return sendSuccess(res, "Fuel log deleted", null);
});
