import type { Response } from "express";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  errors?: unknown;
};

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200
) {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
) {
  const body: ApiResponse<null> = {
    success: false,
    message,
    data: null,
  };

  if (errors !== undefined) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
}
