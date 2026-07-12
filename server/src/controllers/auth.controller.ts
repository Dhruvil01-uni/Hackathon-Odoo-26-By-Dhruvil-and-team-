import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import * as authService from "../services/auth.service";
import { AppError } from "../utils/app-error";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    email: req.body.email,
    password: req.body.password,
  });

  return sendSuccess(res, "Login successful", result);
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const user = await authService.getCurrentUser(req.user.id);

  return sendSuccess(res, "Current user retrieved", user);
});

export const logout = asyncHandler(async (_req, res) => {
  return sendSuccess(res, "Logout successful", null);
});
