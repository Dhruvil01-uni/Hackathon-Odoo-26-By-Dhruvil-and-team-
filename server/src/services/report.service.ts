import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type ReportFilters = {
  vehicleId?: string;
  region?: string;
  vehicleType?: string;
};

type VehicleReportRow = {
  vehicleId: string;
  registration: string;
  name: string;
  type: string;
  region: string;
  status: string;
  acquisitionCost: number;
  totalDistance: number;
  totalFuelLiters: number;
  fuelCost: number;
  maintenanceCost: number;
  expenseCost: number;
  operationalCost: number;
  revenue: number;
  fuelEfficiency: number;
  roi: number | null;
};

function round(value: number) {
  return Number(value.toFixed(2));
}

function buildVehicleWhere(filters: ReportFilters): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};

  if (filters.vehicleId) {
    where.id = filters.vehicleId;
  }

  if (filters.region) {
    where.region = {
      equals: filters.region,
      mode: "insensitive",
    };
  }

  if (filters.vehicleType) {
    where.type = {
      equals: filters.vehicleType,
      mode: "insensitive",
    };
  }

  return where;
}

function escapeCsv(value: string | number | null) {
  if (value === null) {
    return "";
  }

  const raw = String(value);

  if (raw.includes(",") || raw.includes("\"") || raw.includes("\n")) {
    return `"${raw.replace(/"/g, "\"\"")}"`;
  }

  return raw;
}

export async function getReports(filters: ReportFilters) {
  const vehicles = await prisma.vehicle.findMany({
    where: buildVehicleWhere(filters),
    include: {
      trips: true,
      fuelLogs: true,
      maintenance: true,
      expenses: true,
    },
    orderBy: { registration: "asc" },
  });

  const vehiclesReport: VehicleReportRow[] = vehicles.map((vehicle) => {
    const totalDistance = vehicle.trips.reduce((sum, trip) => sum + trip.distance, 0);
    const revenue = vehicle.trips.reduce((sum, trip) => sum + (trip.revenue ?? 0), 0);
    const totalFuelLiters = vehicle.fuelLogs.reduce(
      (sum, fuelLog) => sum + fuelLog.liters,
      0
    );
    const fuelCost = vehicle.fuelLogs.reduce((sum, fuelLog) => sum + fuelLog.cost, 0);
    const maintenanceCost = vehicle.maintenance.reduce(
      (sum, maintenance) => sum + maintenance.cost,
      0
    );
    const expenseCost = vehicle.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const operationalCost = fuelCost + maintenanceCost + expenseCost;
    const fuelEfficiency =
      totalFuelLiters === 0 ? 0 : round(totalDistance / totalFuelLiters);
    const roi =
      vehicle.purchaseCost === 0
        ? null
        : round(((revenue - (maintenanceCost + fuelCost)) / vehicle.purchaseCost) * 100);

    return {
      vehicleId: vehicle.id,
      registration: vehicle.registration,
      name: vehicle.name,
      type: vehicle.type,
      region: vehicle.region,
      status: vehicle.status,
      acquisitionCost: round(vehicle.purchaseCost),
      totalDistance: round(totalDistance),
      totalFuelLiters: round(totalFuelLiters),
      fuelCost: round(fuelCost),
      maintenanceCost: round(maintenanceCost),
      expenseCost: round(expenseCost),
      operationalCost: round(operationalCost),
      revenue: round(revenue),
      fuelEfficiency,
      roi,
    };
  });

  const totals = vehiclesReport.reduce(
    (acc, row) => ({
      totalDistance: acc.totalDistance + row.totalDistance,
      totalFuelLiters: acc.totalFuelLiters + row.totalFuelLiters,
      fuelCost: acc.fuelCost + row.fuelCost,
      maintenanceCost: acc.maintenanceCost + row.maintenanceCost,
      expenseCost: acc.expenseCost + row.expenseCost,
      operationalCost: acc.operationalCost + row.operationalCost,
      revenue: acc.revenue + row.revenue,
    }),
    {
      totalDistance: 0,
      totalFuelLiters: 0,
      fuelCost: 0,
      maintenanceCost: 0,
      expenseCost: 0,
      operationalCost: 0,
      revenue: 0,
    }
  );

  return {
    filters,
    summary: {
      vehicleCount: vehiclesReport.length,
      totalDistance: round(totals.totalDistance),
      totalFuelLiters: round(totals.totalFuelLiters),
      fuelCost: round(totals.fuelCost),
      maintenanceCost: round(totals.maintenanceCost),
      expenseCost: round(totals.expenseCost),
      operationalCost: round(totals.operationalCost),
      revenue: round(totals.revenue),
      averageFuelEfficiency:
        totals.totalFuelLiters === 0
          ? 0
          : round(totals.totalDistance / totals.totalFuelLiters),
    },
    vehicles: vehiclesReport,
  };
}

export function toCsv(report: Awaited<ReturnType<typeof getReports>>) {
  const headers: (keyof VehicleReportRow)[] = [
    "vehicleId",
    "registration",
    "name",
    "type",
    "region",
    "status",
    "acquisitionCost",
    "totalDistance",
    "totalFuelLiters",
    "fuelCost",
    "maintenanceCost",
    "expenseCost",
    "operationalCost",
    "revenue",
    "fuelEfficiency",
    "roi",
  ];
  const rows = report.vehicles.map((vehicle) =>
    headers.map((header) => escapeCsv(vehicle[header])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
