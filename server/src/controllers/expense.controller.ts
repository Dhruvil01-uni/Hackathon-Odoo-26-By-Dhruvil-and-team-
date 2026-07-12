import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import * as expenseService from "../services/expense.service";

function getParamId(value: unknown) {
  return String(value);
}

export const listExpenses = asyncHandler(async (req, res) => {
  const filters: expenseService.ExpenseListFilters = {};

  if (typeof req.query.vehicleId === "string") {
    filters.vehicleId = req.query.vehicleId;
  }

  if (typeof req.query.category === "string") {
    filters.category = req.query.category;
  }

  const expenses = await expenseService.listExpenses(filters);

  return sendSuccess(res, "Expenses retrieved", expenses);
});

export const getExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(getParamId(req.params.id));

  return sendSuccess(res, "Expense retrieved", expense);
});

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.body);

  return sendSuccess(res, "Expense created", expense, 201);
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(getParamId(req.params.id), req.body);

  return sendSuccess(res, "Expense updated", expense);
});

export const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(getParamId(req.params.id));

  return sendSuccess(res, "Expense deleted", null);
});
