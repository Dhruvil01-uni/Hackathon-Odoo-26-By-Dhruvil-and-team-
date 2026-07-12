import { Router } from "express";
import { USER_ROLES } from "../constants/roles";
import * as expenseController from "../controllers/expense.controller";
import { authenticate, requireRoles } from "../middleware/auth.middleware";
import {
  createExpenseValidator,
  expenseIdValidator,
  listExpensesValidator,
  updateExpenseValidator,
} from "../validators/expense.validator";

export const expenseRouter = Router();

expenseRouter.use(authenticate);
expenseRouter.use(requireRoles(USER_ROLES.FLEET_MANAGER, USER_ROLES.FINANCIAL_ANALYST));

expenseRouter.get("/", listExpensesValidator, expenseController.listExpenses);
expenseRouter.get("/:id", expenseIdValidator, expenseController.getExpense);
expenseRouter.post("/", createExpenseValidator, expenseController.createExpense);
expenseRouter.put("/:id", updateExpenseValidator, expenseController.updateExpense);
expenseRouter.delete("/:id", expenseIdValidator, expenseController.deleteExpense);
