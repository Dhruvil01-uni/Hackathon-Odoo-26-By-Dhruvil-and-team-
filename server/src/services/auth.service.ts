import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import type { User, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";
import type { AuthTokenPayload } from "../types/auth";

type LoginInput = {
  email: string;
  password: string;
};

type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function signAccessToken(user: SafeUser) {
  const payload: AuthTokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const expiresIn = env.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]>;
  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign(payload, env.jwtSecret as Secret, options);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const safeUser = toSafeUser(user);

  return {
    user: safeUser,
    token: signAccessToken(safeUser),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toSafeUser(user);
}
