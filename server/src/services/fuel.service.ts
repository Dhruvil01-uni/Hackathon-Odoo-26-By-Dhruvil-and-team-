import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/app-error";

export type FuelLogListFilters = {
  vehicleId?: string;
  tripId?: string;
};

type CreateFuelLogInput = {
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  mileage: number;
  loggedAt?: string | Date;
};

type UpdateFuelLogInput = {
  tripId?: string | null;
  liters?: number;
  cost?: number;
  mileage?: number;
  loggedAt?: string | Date;
};

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function buildFuelWhere(filters: FuelLogListFilters): Prisma.FuelLogWhereInput {
  const where: Prisma.FuelLogWhereInput = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.tripId) {
    where.tripId = filters.tripId;
  }

  return where;
}

async function assertVehicleExists(tx: Prisma.TransactionClient, vehicleId: string) {
  const vehicle = await tx.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  return vehicle;
}

async function assertTripBelongsToVehicle(
  tx: Prisma.TransactionClient,
  tripId: string,
  vehicleId: string
) {
  const trip = await tx.trip.findUnique({
    where: { id: tripId },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  if (trip.vehicleId !== vehicleId) {
    throw new AppError("Fuel log trip must belong to the selected vehicle", 409);
  }

  return trip;
}

export async function listFuelLogs(filters: FuelLogListFilters) {
  return prisma.fuelLog.findMany({
    where: buildFuelWhere(filters),
    include: {
      vehicle: true,
      trip: true,
    },
    orderBy: { loggedAt: "desc" },
  });
}

export async function getFuelLogById(id: string) {
  const fuelLog = await prisma.fuelLog.findUnique({
    where: { id },
    include: {
      vehicle: true,
      trip: true,
    },
  });

  if (!fuelLog) {
    throw new AppError("Fuel log not found", 404);
  }

  return fuelLog;
}

export async function createFuelLog(input: CreateFuelLogInput) {
  return prisma.$transaction(async (tx) => {
    await assertVehicleExists(tx, input.vehicleId);

    if (input.tripId) {
      await assertTripBelongsToVehicle(tx, input.tripId, input.vehicleId);
    }

    const data: Prisma.FuelLogUncheckedCreateInput = {
      vehicleId: input.vehicleId,
      liters: input.liters,
      cost: input.cost,
      mileage: input.mileage,
    };

    if (input.tripId !== undefined) {
      data.tripId = input.tripId;
    }

    if (input.loggedAt !== undefined) {
      data.loggedAt = toDate(input.loggedAt);
    }

    return tx.fuelLog.create({
      data,
      include: {
        vehicle: true,
        trip: true,
      },
    });
  });
}

export async function updateFuelLog(id: string, input: UpdateFuelLogInput) {
  return prisma.$transaction(async (tx) => {
    const fuelLog = await tx.fuelLog.findUnique({
      where: { id },
    });

    if (!fuelLog) {
      throw new AppError("Fuel log not found", 404);
    }

    if (input.tripId) {
      await assertTripBelongsToVehicle(tx, input.tripId, fuelLog.vehicleId);
    }

    const data: Prisma.FuelLogUpdateInput = {};

    if (input.tripId !== undefined) {
      data.trip = input.tripId ? { connect: { id: input.tripId } } : { disconnect: true };
    }

    if (input.liters !== undefined) {
      data.liters = input.liters;
    }

    if (input.cost !== undefined) {
      data.cost = input.cost;
    }

    if (input.mileage !== undefined) {
      data.mileage = input.mileage;
    }

    if (input.loggedAt !== undefined) {
      data.loggedAt = toDate(input.loggedAt);
    }

    return tx.fuelLog.update({
      where: { id },
      data,
      include: {
        vehicle: true,
        trip: true,
      },
    });
  });
}

export async function deleteFuelLog(id: string) {
  const fuelLog = await prisma.fuelLog.findUnique({
    where: { id },
  });

  if (!fuelLog) {
    throw new AppError("Fuel log not found", 404);
  }

  return prisma.fuelLog.delete({
    where: { id },
  });
}
