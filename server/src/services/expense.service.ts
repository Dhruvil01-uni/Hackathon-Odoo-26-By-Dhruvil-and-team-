import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/app-error";

export type ExpenseListFilters = {
  vehicleId?: string;
  category?: string;
};

type CreateExpenseInput = {
  vehicleId: string;
  category: string;
  amount: number;
  notes?: string;
  expenseDate?: string | Date;
};

type UpdateExpenseInput = {
  category?: string;
  amount?: number;
  notes?: string | null;
  expenseDate?: string | Date;
};

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function buildExpenseWhere(filters: ExpenseListFilters): Prisma.ExpenseWhereInput {
  const where: Prisma.ExpenseWhereInput = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.category) {
    where.category = {
      equals: filters.category,
      mode: "insensitive",
    };
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

export async function listExpenses(filters: ExpenseListFilters) {
  return prisma.expense.findMany({
    where: buildExpenseWhere(filters),
    include: { vehicle: true },
    orderBy: { expenseDate: "desc" },
  });
}

export async function getExpenseById(id: string) {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { vehicle: true },
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  return expense;
}

export async function createExpense(input: CreateExpenseInput) {
  return prisma.$transaction(async (tx) => {
    await assertVehicleExists(tx, input.vehicleId);

    const data: Prisma.ExpenseCreateInput = {
      vehicle: { connect: { id: input.vehicleId } },
      category: input.category.trim(),
      amount: input.amount,
    };

    if (input.notes !== undefined) {
      data.notes = input.notes.trim();
    }

    if (input.expenseDate !== undefined) {
      data.expenseDate = toDate(input.expenseDate);
    }

    return tx.expense.create({
      data,
      include: { vehicle: true },
    });
  });
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  const existing = await prisma.expense.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Expense not found", 404);
  }

  const data: Prisma.ExpenseUpdateInput = {};

  if (input.category !== undefined) {
    data.category = input.category.trim();
  }

  if (input.amount !== undefined) {
    data.amount = input.amount;
  }

  if (input.notes !== undefined) {
    data.notes = input.notes === null ? null : input.notes.trim();
  }

  if (input.expenseDate !== undefined) {
    data.expenseDate = toDate(input.expenseDate);
  }

  return prisma.expense.update({
    where: { id },
    data,
    include: { vehicle: true },
  });
}

export async function deleteExpense(id: string) {
  const expense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!expense) {
    throw new AppError("Expense not found", 404);
  }

  return prisma.expense.delete({
    where: { id },
  });
}
