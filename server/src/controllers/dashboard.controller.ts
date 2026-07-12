import { VehicleStatus } from "@prisma/client";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import * as dashboardService from "../services/dashboard.service";

export const getDashboard = asyncHandler(async (req, res) => {
  const filters: dashboardService.DashboardFilters = {};

  if (typeof req.query.vehicleType === "string") {
    filters.vehicleType = req.query.vehicleType;
  }

  if (typeof req.query.vehicleStatus === "string") {
    filters.vehicleStatus = req.query.vehicleStatus as VehicleStatus;
  }

  if (typeof req.query.region === "string") {
    filters.region = req.query.region;
  }

  const dashboard = await dashboardService.getDashboard(filters);

  return sendSuccess(res, "Dashboard retrieved", dashboard);
});
