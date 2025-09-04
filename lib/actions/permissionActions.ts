"use server"

import { PermissionController } from "@/lib/controllers/permission.controller";
import { AuthController } from "@/lib/controllers/auth.controller";

const permissionController = new PermissionController();
const authController = new AuthController();

export async function getPermissionsByUserId(userId: string): Promise<string[]> {
  return await permissionController.getPermissionsByUserId(userId);
}

export async function getAllPermissions(sessionId: string): Promise<{ id: string; name: string }[]> {
  const perms = await authController.getPermissionsBySessionId(sessionId);
  if (!perms.includes('permissions:read') && !perms.includes('permissions:manage')) {
    throw new Error('Unauthorized');
  }
  return await permissionController.getAllPermissions();
}
