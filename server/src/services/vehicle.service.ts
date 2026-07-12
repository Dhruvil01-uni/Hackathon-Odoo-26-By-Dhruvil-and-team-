import { Prisma, VehicleStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/app-error";

export type VehicleListFilters = {
  status?: VehicleStatus;
  type?: string;
  region?: string;
  search?: string;
};

type CreateVehicleInput = {
  registration: string;
  name: string;
  type: string;
  region: string;
  capacity: number;
  odometer: number;
  purchaseCost: number;
  status?: VehicleStatus;
};

type UpdateVehicleInput = Partial<CreateVehicleInput>;

function normalizeRegistration(registration: string) {
  return registration.trim().toUpperCase();
}

function buildVehicleWhere(filters: VehicleListFilters): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = {
      equals: filters.type,
      mode: "insensitive",
    };
  }

  if (filters.region) {
    where.region = {
      equals: filters.region,
      mode: "insensitive",
    };
  }

  if (filters.search) {
    where.OR = [
      { registration: { contains: filters.search, mode: "insensitive" } },
      { name: { contains: filters.search, mode: "insensitive" } },
      { type: { contains: filters.search, mode: "insensitive" } },
      { region: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listVehicles(filters: VehicleListFilters) {
  return prisma.vehicle.findMany({
    where: buildVehicleWhere(filters),
    orderBy: { createdAt: "desc" },
  });
}

export async function getVehicleById(id: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  return vehicle;
}

export async function createVehicle(input: CreateVehicleInput) {
  const registration = normalizeRegistration(input.registration);
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { registration },
  });

  if (existingVehicle) {
    throw new AppError("Vehicle registration must be unique", 409);
  }

  return prisma.vehicle.create({
    data: {
      registration,
      name: input.name.trim(),
      type: input.type.trim(),
      region: input.region.trim(),
      capacity: input.capacity,
      odometer: input.odometer,
      purchaseCost: input.purchaseCost,
      status: input.status ?? VehicleStatus.AVAILABLE,
    },
  });
}

export async function updateVehicle(id: string, input: UpdateVehicleInput) {
  await getVehicleById(id);

  const registration = input.registration
    ? normalizeRegistration(input.registration)
    : undefined;

  if (registration) {
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registration },
    });

    if (existingVehicle && existingVehicle.id !== id) {
      throw new AppError("Vehicle registration must be unique", 409);
    }
  }

  const data: Prisma.VehicleUpdateInput = {};

  if (registration) {
    data.registration = registration;
  }

  if (input.name !== undefined) {
    data.name = input.name.trim();
  }

  if (input.type !== undefined) {
    data.type = input.type.trim();
  }

  if (input.region !== undefined) {
    data.region = input.region.trim();
  }

  if (input.capacity !== undefined) {
    data.capacity = input.capacity;
  }

  if (input.odometer !== undefined) {
    data.odometer = input.odometer;
  }

  if (input.purchaseCost !== undefined) {
    data.purchaseCost = input.purchaseCost;
  }

  if (input.status !== undefined) {
    data.status = input.status;
  }

  return prisma.vehicle.update({
    where: { id },
    data,
  });
}

export async function deleteVehicle(id: string) {
  const vehicle = await getVehicleById(id);

  if (vehicle.status === VehicleStatus.ON_TRIP) {
    throw new AppError("Vehicle on trip cannot be deleted", 409);
  }

  return prisma.vehicle.delete({
    where: { id },
  });
}

export async function listDispatchableVehicles(filters: Omit<VehicleListFilters, "status">) {
  return listVehicles({
    ...filters,
    status: VehicleStatus.AVAILABLE,
  });
}
