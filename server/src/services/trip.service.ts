import {
  DriverStatus,
  Prisma,
  TripStatus,
  VehicleStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/app-error";

export type TripListFilters = {
  status?: TripStatus;
  vehicleId?: string;
  driverId?: string;
};

type CreateTripInput = {
  vehicleId: string;
  driverId: string;
  source: string;
  destination: string;
  cargoWeight: number;
  distance: number;
  revenue?: number;
};

type UpdateTripInput = Partial<CreateTripInput>;

type CompleteTripInput = {
  finalOdometer?: number;
  fuelConsumed?: number;
  revenue?: number;
};

type TripWithAssignments = Prisma.TripGetPayload<{
  include: {
    vehicle: true;
    driver: true;
  };
}>;

function buildTripWhere(filters: TripListFilters): Prisma.TripWhereInput {
  const where: Prisma.TripWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.driverId) {
    where.driverId = filters.driverId;
  }

  return where;
}

function isLicenseExpired(expiryDate: Date) {
  return expiryDate.getTime() <= Date.now();
}

async function getTripWithAssignments(
  tx: Prisma.TransactionClient,
  id: string
): Promise<TripWithAssignments> {
  const trip = await tx.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  return trip;
}

async function validateAssignments(
  tx: Prisma.TransactionClient,
  input: Pick<CreateTripInput, "vehicleId" | "driverId" | "cargoWeight">
) {
  const [vehicle, driver] = await Promise.all([
    tx.vehicle.findUnique({ where: { id: input.vehicleId } }),
    tx.driver.findUnique({ where: { id: input.driverId } }),
  ]);

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  if (vehicle.status !== VehicleStatus.AVAILABLE) {
    throw new AppError("Vehicle is not available for dispatch", 409);
  }

  if (driver.status !== DriverStatus.AVAILABLE) {
    throw new AppError("Driver is not available for dispatch", 409);
  }

  if (isLicenseExpired(driver.expiryDate)) {
    throw new AppError("Driver license is expired", 409);
  }

  if (input.cargoWeight > vehicle.capacity) {
    throw new AppError("Cargo weight exceeds vehicle maximum load capacity", 409);
  }

  return { vehicle, driver };
}

export async function listTrips(filters: TripListFilters) {
  return prisma.trip.findMany({
    where: buildTripWhere(filters),
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTripById(id: string) {
  return prisma.$transaction((tx) => getTripWithAssignments(tx, id));
}

export async function createTrip(input: CreateTripInput) {
  return prisma.$transaction(async (tx) => {
    await validateAssignments(tx, input);

    const data: Prisma.TripCreateInput = {
      vehicle: { connect: { id: input.vehicleId } },
      driver: { connect: { id: input.driverId } },
      source: input.source.trim(),
      destination: input.destination.trim(),
      cargoWeight: input.cargoWeight,
      distance: input.distance,
    };

    if (input.revenue !== undefined) {
      data.revenue = input.revenue;
    }

    return tx.trip.create({
      data,
      include: {
        vehicle: true,
        driver: true,
      },
    });
  });
}

export async function updateTrip(id: string, input: UpdateTripInput) {
  return prisma.$transaction(async (tx) => {
    const currentTrip = await getTripWithAssignments(tx, id);

    if (currentTrip.status !== TripStatus.DRAFT) {
      throw new AppError("Only draft trips can be updated", 409);
    }

    const nextVehicleId = input.vehicleId ?? currentTrip.vehicleId;
    const nextDriverId = input.driverId ?? currentTrip.driverId;
    const nextCargoWeight = input.cargoWeight ?? currentTrip.cargoWeight;

    await validateAssignments(tx, {
      vehicleId: nextVehicleId,
      driverId: nextDriverId,
      cargoWeight: nextCargoWeight,
    });

    const data: Prisma.TripUpdateInput = {};

    if (input.vehicleId !== undefined) {
      data.vehicle = { connect: { id: input.vehicleId } };
    }

    if (input.driverId !== undefined) {
      data.driver = { connect: { id: input.driverId } };
    }

    if (input.source !== undefined) {
      data.source = input.source.trim();
    }

    if (input.destination !== undefined) {
      data.destination = input.destination.trim();
    }

    if (input.cargoWeight !== undefined) {
      data.cargoWeight = input.cargoWeight;
    }

    if (input.distance !== undefined) {
      data.distance = input.distance;
    }

    if (input.revenue !== undefined) {
      data.revenue = input.revenue;
    }

    return tx.trip.update({
      where: { id },
      data,
      include: {
        vehicle: true,
        driver: true,
      },
    });
  });
}

export async function dispatchTrip(id: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await getTripWithAssignments(tx, id);

    if (trip.status !== TripStatus.DRAFT) {
      throw new AppError("Only draft trips can be dispatched", 409);
    }

    await validateAssignments(tx, {
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      cargoWeight: trip.cargoWeight,
    });

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: VehicleStatus.ON_TRIP },
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: DriverStatus.ON_TRIP },
    });

    return tx.trip.update({
      where: { id },
      data: {
        status: TripStatus.DISPATCHED,
        dispatchedAt: new Date(),
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });
  });
}

export async function completeTrip(id: string, input: CompleteTripInput) {
  return prisma.$transaction(async (tx) => {
    const trip = await getTripWithAssignments(tx, id);

    if (trip.status !== TripStatus.DISPATCHED) {
      throw new AppError("Only dispatched trips can be completed", 409);
    }

    if (
      input.finalOdometer !== undefined &&
      input.finalOdometer < trip.vehicle.odometer
    ) {
      throw new AppError("Final odometer cannot be less than current vehicle odometer", 409);
    }

    const tripData: Prisma.TripUpdateInput = {
      status: TripStatus.COMPLETED,
      completedAt: new Date(),
    };

    if (input.finalOdometer !== undefined) {
      tripData.finalOdometer = input.finalOdometer;
    }

    if (input.fuelConsumed !== undefined) {
      tripData.fuelConsumed = input.fuelConsumed;
    }

    if (input.revenue !== undefined) {
      tripData.revenue = input.revenue;
    }

    const vehicleData: Prisma.VehicleUpdateInput = {
      status: VehicleStatus.AVAILABLE,
    };

    if (input.finalOdometer !== undefined) {
      vehicleData.odometer = input.finalOdometer;
    }

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: vehicleData,
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: DriverStatus.AVAILABLE },
    });

    return tx.trip.update({
      where: { id },
      data: tripData,
      include: {
        vehicle: true,
        driver: true,
      },
    });
  });
}

export async function cancelTrip(id: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await getTripWithAssignments(tx, id);

    if (trip.status === TripStatus.COMPLETED) {
      throw new AppError("Completed trips cannot be cancelled", 409);
    }

    if (trip.status === TripStatus.CANCELLED) {
      throw new AppError("Trip is already cancelled", 409);
    }

    if (trip.status === TripStatus.DISPATCHED) {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.AVAILABLE },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE },
      });
    }

    return tx.trip.update({
      where: { id },
      data: {
        status: TripStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });
  });
}

export async function deleteTrip(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  if (trip.status === TripStatus.DISPATCHED) {
    throw new AppError("Dispatched trips cannot be deleted", 409);
  }

  return prisma.trip.delete({
    where: { id },
  });
}
