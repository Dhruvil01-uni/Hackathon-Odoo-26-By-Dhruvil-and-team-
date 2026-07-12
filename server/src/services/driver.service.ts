import { DriverStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/app-error";

export type DriverListFilters = {
  status?: DriverStatus;
  search?: string;
  licenseExpiringBefore?: Date;
};

type CreateDriverInput = {
  name: string;
  phone: string;
  licenseNumber: string;
  licenseCategory: string;
  expiryDate: string | Date;
  safetyScore: number;
  status?: DriverStatus;
};

type UpdateDriverInput = Partial<CreateDriverInput>;

function normalizeLicenseNumber(licenseNumber: string) {
  return licenseNumber.trim().toUpperCase();
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function buildDriverWhere(filters: DriverListFilters): Prisma.DriverWhereInput {
  const where: Prisma.DriverWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.licenseExpiringBefore) {
    where.expiryDate = {
      lte: filters.licenseExpiringBefore,
    };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
      { licenseNumber: { contains: filters.search, mode: "insensitive" } },
      { licenseCategory: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listDrivers(filters: DriverListFilters) {
  return prisma.driver.findMany({
    where: buildDriverWhere(filters),
    orderBy: { createdAt: "desc" },
  });
}

export async function getDriverById(id: string) {
  const driver = await prisma.driver.findUnique({
    where: { id },
  });

  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  return driver;
}

export async function createDriver(input: CreateDriverInput) {
  const licenseNumber = normalizeLicenseNumber(input.licenseNumber);
  const existingDriver = await prisma.driver.findUnique({
    where: { licenseNumber },
  });

  if (existingDriver) {
    throw new AppError("Driver license number must be unique", 409);
  }

  return prisma.driver.create({
    data: {
      name: input.name.trim(),
      phone: input.phone.trim(),
      licenseNumber,
      licenseCategory: input.licenseCategory.trim(),
      expiryDate: toDate(input.expiryDate),
      safetyScore: input.safetyScore,
      status: input.status ?? DriverStatus.AVAILABLE,
    },
  });
}

export async function updateDriver(id: string, input: UpdateDriverInput) {
  await getDriverById(id);

  const licenseNumber = input.licenseNumber
    ? normalizeLicenseNumber(input.licenseNumber)
    : undefined;

  if (licenseNumber) {
    const existingDriver = await prisma.driver.findUnique({
      where: { licenseNumber },
    });

    if (existingDriver && existingDriver.id !== id) {
      throw new AppError("Driver license number must be unique", 409);
    }
  }

  const data: Prisma.DriverUpdateInput = {};

  if (input.name !== undefined) {
    data.name = input.name.trim();
  }

  if (input.phone !== undefined) {
    data.phone = input.phone.trim();
  }

  if (licenseNumber) {
    data.licenseNumber = licenseNumber;
  }

  if (input.licenseCategory !== undefined) {
    data.licenseCategory = input.licenseCategory.trim();
  }

  if (input.expiryDate !== undefined) {
    data.expiryDate = toDate(input.expiryDate);
  }

  if (input.safetyScore !== undefined) {
    data.safetyScore = input.safetyScore;
  }

  if (input.status !== undefined) {
    data.status = input.status;
  }

  return prisma.driver.update({
    where: { id },
    data,
  });
}

export async function deleteDriver(id: string) {
  const driver = await getDriverById(id);

  if (driver.status === DriverStatus.ON_TRIP) {
    throw new AppError("Driver on trip cannot be deleted", 409);
  }

  return prisma.driver.delete({
    where: { id },
  });
}

export async function listDispatchableDrivers(filters: Pick<DriverListFilters, "search">) {
  const where: Prisma.DriverWhereInput = {
    status: DriverStatus.AVAILABLE,
    expiryDate: {
      gt: new Date(),
    },
  };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
      { licenseNumber: { contains: filters.search, mode: "insensitive" } },
      { licenseCategory: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.driver.findMany({
    where,
    orderBy: { name: "asc" },
  });
}
