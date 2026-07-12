import {
  MaintenanceStatus,
  Prisma,
  VehicleStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/app-error";

export type MaintenanceListFilters = {
  vehicleId?: string;
  status?: MaintenanceStatus;
};

type CreateMaintenanceInput = {
  vehicleId: string;
  description: string;
  cost: number;
  status?: MaintenanceStatus;
};

type UpdateMaintenanceInput = {
  description?: string;
  cost?: number;
  status?: MaintenanceStatus;
};

function buildMaintenanceWhere(
  filters: MaintenanceListFilters
): Prisma.MaintenanceWhereInput {
  const where: Prisma.MaintenanceWhereInput = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return where;
}

async function getMaintenanceOrThrow(tx: Prisma.TransactionClient, id: string) {
  const maintenance = await tx.maintenance.findUnique({
    where: { id },
    include: { vehicle: true },
  });

  if (!maintenance) {
    throw new AppError("Maintenance record not found", 404);
  }

  return maintenance;
}

async function assertVehicleCanEnterMaintenance(
  tx: Prisma.TransactionClient,
  vehicleId: string
) {
  const vehicle = await tx.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  if (vehicle.status === VehicleStatus.ON_TRIP) {
    throw new AppError("Vehicle on trip cannot enter maintenance", 409);
  }

  if (vehicle.status === VehicleStatus.RETIRED) {
    throw new AppError("Retired vehicle cannot enter maintenance", 409);
  }

  return vehicle;
}

export async function listMaintenance(filters: MaintenanceListFilters) {
  return prisma.maintenance.findMany({
    where: buildMaintenanceWhere(filters),
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMaintenanceById(id: string) {
  return prisma.$transaction((tx) => getMaintenanceOrThrow(tx, id));
}

export async function createMaintenance(input: CreateMaintenanceInput) {
  return prisma.$transaction(async (tx) => {
    const status = input.status ?? MaintenanceStatus.IN_PROGRESS;

    if (status !== MaintenanceStatus.COMPLETED) {
      await assertVehicleCanEnterMaintenance(tx, input.vehicleId);
    }

    const data: Prisma.MaintenanceUncheckedCreateInput = {
      vehicleId: input.vehicleId,
      description: input.description.trim(),
      cost: input.cost,
      status,
    };

    if (status === MaintenanceStatus.COMPLETED) {
      data.completedAt = new Date();
    }

    const maintenance = await tx.maintenance.create({
      data,
      include: { vehicle: true },
    });

    if (status !== MaintenanceStatus.COMPLETED) {
      await tx.vehicle.update({
        where: { id: input.vehicleId },
        data: { status: VehicleStatus.IN_SHOP },
      });
    }

    return maintenance;
  });
}

export async function updateMaintenance(id: string, input: UpdateMaintenanceInput) {
  return prisma.$transaction(async (tx) => {
    const current = await getMaintenanceOrThrow(tx, id);
    const nextStatus = input.status ?? current.status;

    if (
      current.status === MaintenanceStatus.COMPLETED &&
      nextStatus !== MaintenanceStatus.COMPLETED
    ) {
      throw new AppError("Completed maintenance cannot be reopened", 409);
    }

    if (
      nextStatus !== MaintenanceStatus.COMPLETED &&
      current.vehicle.status === VehicleStatus.ON_TRIP
    ) {
      throw new AppError("Vehicle on trip cannot enter maintenance", 409);
    }

    const data: Prisma.MaintenanceUpdateInput = {};

    if (input.description !== undefined) {
      data.description = input.description.trim();
    }

    if (input.cost !== undefined) {
      data.cost = input.cost;
    }

    if (input.status !== undefined) {
      data.status = input.status;
      data.completedAt =
        input.status === MaintenanceStatus.COMPLETED ? new Date() : null;
    }

    const maintenance = await tx.maintenance.update({
      where: { id },
      data,
      include: { vehicle: true },
    });

    if (nextStatus === MaintenanceStatus.COMPLETED) {
      if (current.vehicle.status !== VehicleStatus.RETIRED) {
        await tx.vehicle.update({
          where: { id: current.vehicleId },
          data: { status: VehicleStatus.AVAILABLE },
        });
      }
    } else if (current.vehicle.status !== VehicleStatus.RETIRED) {
      await tx.vehicle.update({
        where: { id: current.vehicleId },
        data: { status: VehicleStatus.IN_SHOP },
      });
    }

    return maintenance;
  });
}

export async function completeMaintenance(id: string) {
  return updateMaintenance(id, {
    status: MaintenanceStatus.COMPLETED,
  });
}

export async function deleteMaintenance(id: string) {
  const maintenance = await prisma.maintenance.findUnique({
    where: { id },
  });

  if (!maintenance) {
    throw new AppError("Maintenance record not found", 404);
  }

  if (maintenance.status !== MaintenanceStatus.COMPLETED) {
    throw new AppError("Only completed maintenance records can be deleted", 409);
  }

  return prisma.maintenance.delete({
    where: { id },
  });
}
