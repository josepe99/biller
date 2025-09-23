import { UserRole } from "@prisma/client";

export interface RoleOption {
  id: string;
  name: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  loginAttempts?: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
