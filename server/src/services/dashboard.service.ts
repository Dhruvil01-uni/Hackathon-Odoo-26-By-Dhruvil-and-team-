import { DriverStatus, TripStatus, VehicleStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type DashboardFilters = {
  vehicleType?: string;
  vehicleStatus?: VehicleStatus;
  region?: string;
};

function buildVehicleWhere(filters: DashboardFilters): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};

  if (filters.vehicleType) {
    where.type = {
      equals: filters.vehicleType,
      mode: "insensitive",
    };
  }

  if (filters.vehicleStatus) {
    where.status = filters.vehicleStatus;
  }

  if (filters.region) {
    where.region = {
      equals: filters.region,
      mode: "insensitive",
    };
  }

  return where;
}

function toPercent(value: number) {
  return Number(value.toFixed(2));
}

export async function getDashboard(filters: DashboardFilters) {
  const vehicleWhere = buildVehicleWhere(filters);
  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    select: {
      id: true,
      status: true,
      type: true,
      region: true,
    },
  });
  const vehicleIds = vehicles.map((vehicle) => vehicle.id);
  const scopedTripWhere: Prisma.TripWhereInput =
    vehicleIds.length > 0 ? { vehicleId: { in: vehicleIds } } : { id: "__none__" };

  const [
    activeTrips,
    pendingTrips,
    driversOnDuty,
    vehicleTypes,
    vehicleRegions,
  ] = await Promise.all([
    prisma.trip.count({
      where: {
        ...scopedTripWhere,
        status: TripStatus.DISPATCHED,
      },
    }),
    prisma.trip.count({
      where: {
        ...scopedTripWhere,
        status: TripStatus.DRAFT,
      },
    }),
    prisma.driver.count({
      where: { status: DriverStatus.ON_TRIP },
    }),
    prisma.vehicle.groupBy({
      by: ["type"],
      _count: { _all: true },
      where: vehicleWhere,
    }),
    prisma.vehicle.groupBy({
      by: ["region"],
      _count: { _all: true },
      where: vehicleWhere,
    }),
  ]);

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === VehicleStatus.ON_TRIP
  ).length;
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === VehicleStatus.AVAILABLE
  ).length;
  const vehiclesInMaintenance = vehicles.filter(
    (vehicle) => vehicle.status === VehicleStatus.IN_SHOP
  ).length;
  const nonRetiredVehicles = vehicles.filter(
    (vehicle) => vehicle.status !== VehicleStatus.RETIRED
  ).length;
  const fleetUtilization =
    nonRetiredVehicles === 0 ? 0 : toPercent((activeVehicles / nonRetiredVehicles) * 100);

  return {
    filters,
    kpis: {
      totalVehicles: vehicles.length,
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization,
    },
    breakdowns: {
      vehicleTypes: vehicleTypes.map((item) => ({
        type: item.type,
        count: item._count._all,
      })),
      regions: vehicleRegions.map((item) => ({
        region: item.region,
        count: item._count._all,
      })),
      statuses: Object.values(VehicleStatus).map((status) => ({
        status,
        count: vehicles.filter((vehicle) => vehicle.status === status).length,
      })),
    },
  };
}
