import { UserRole } from "@prisma/client";

export const USER_ROLES = {
  FLEET_MANAGER: UserRole.FLEET_MANAGER,
  DRIVER: UserRole.DRIVER,
  SAFETY_OFFICER: UserRole.SAFETY_OFFICER,
  FINANCIAL_ANALYST: UserRole.FINANCIAL_ANALYST,
} as const;

export const ALL_USER_ROLES = Object.values(USER_ROLES);
