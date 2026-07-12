import { DriverStatus } from "@prisma/client";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import * as driverService from "../services/driver.service";

function getParamId(value: unknown) {
  return String(value);
}

export const listDrivers = asyncHandler(async (req, res) => {
  const filters: driverService.DriverListFilters = {};

  if (typeof req.query.status === "string") {
    filters.status = req.query.status as DriverStatus;
  }

  if (typeof req.query.search === "string") {
    filters.search = req.query.search;
  }

  if (typeof req.query.licenseExpiringBefore === "string") {
    filters.licenseExpiringBefore = new Date(req.query.licenseExpiringBefore);
  }

  const drivers = await driverService.listDrivers(filters);

  return sendSuccess(res, "Drivers retrieved", drivers);
});

export const listDispatchableDrivers = asyncHandler(async (req, res) => {
  const filters: Pick<driverService.DriverListFilters, "search"> = {};

  if (typeof req.query.search === "string") {
    filters.search = req.query.search;
  }

  const drivers = await driverService.listDispatchableDrivers(filters);

  return sendSuccess(res, "Dispatchable drivers retrieved", drivers);
});

export const getDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.getDriverById(getParamId(req.params.id));

  return sendSuccess(res, "Driver retrieved", driver);
});

export const createDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.createDriver(req.body);

  return sendSuccess(res, "Driver created", driver, 201);
});

export const updateDriver = asyncHandler(async (req, res) => {
  const driver = await driverService.updateDriver(getParamId(req.params.id), req.body);

  return sendSuccess(res, "Driver updated", driver);
});

export const deleteDriver = asyncHandler(async (req, res) => {
  await driverService.deleteDriver(getParamId(req.params.id));

  return sendSuccess(res, "Driver deleted", null);
});
