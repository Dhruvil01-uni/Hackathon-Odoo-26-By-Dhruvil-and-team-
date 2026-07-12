import { MaintenanceStatus } from "@prisma/client";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import * as maintenanceService from "../services/maintenance.service";

function getParamId(value: unknown) {
  return String(value);
}

export const listMaintenance = asyncHandler(async (req, res) => {
  const filters: maintenanceService.MaintenanceListFilters = {};

  if (typeof req.query.vehicleId === "string") {
    filters.vehicleId = req.query.vehicleId;
  }

  if (typeof req.query.status === "string") {
    filters.status = req.query.status as MaintenanceStatus;
  }

  const records = await maintenanceService.listMaintenance(filters);

  return sendSuccess(res, "Maintenance records retrieved", records);
});

export const getMaintenance = asyncHandler(async (req, res) => {
  const record = await maintenanceService.getMaintenanceById(getParamId(req.params.id));

  return sendSuccess(res, "Maintenance record retrieved", record);
});

export const createMaintenance = asyncHandler(async (req, res) => {
  const record = await maintenanceService.createMaintenance(req.body);

  return sendSuccess(res, "Maintenance record created", record, 201);
});

export const updateMaintenance = asyncHandler(async (req, res) => {
  const record = await maintenanceService.updateMaintenance(
    getParamId(req.params.id),
    req.body
  );

  return sendSuccess(res, "Maintenance record updated", record);
});

export const completeMaintenance = asyncHandler(async (req, res) => {
  const record = await maintenanceService.completeMaintenance(getParamId(req.params.id));

  return sendSuccess(res, "Maintenance record completed", record);
});

export const deleteMaintenance = asyncHandler(async (req, res) => {
  await maintenanceService.deleteMaintenance(getParamId(req.params.id));

  return sendSuccess(res, "Maintenance record deleted", null);
});
