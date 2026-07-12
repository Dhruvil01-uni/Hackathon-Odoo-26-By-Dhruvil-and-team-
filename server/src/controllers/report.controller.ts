import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import * as reportService from "../services/report.service";

function buildFilters(query: Record<string, unknown>) {
  const filters: reportService.ReportFilters = {};

  if (typeof query.vehicleId === "string") {
    filters.vehicleId = query.vehicleId;
  }

  if (typeof query.region === "string") {
    filters.region = query.region;
  }

  if (typeof query.vehicleType === "string") {
    filters.vehicleType = query.vehicleType;
  }

  return filters;
}

export const getReports = asyncHandler(async (req, res) => {
  const report = await reportService.getReports(buildFilters(req.query));

  return sendSuccess(res, "Reports retrieved", report);
});

export const exportReportsCsv = asyncHandler(async (req, res) => {
  const report = await reportService.getReports(buildFilters(req.query));
  const csv = reportService.toCsv(report);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=transitops-report.csv");

  return res.status(200).send(csv);
});
