"use server"

import { PermissionController } from "@/lib/controllers/permission.controller";

const permissionController = new PermissionController();


export async function getPermissionsByUserId(userId: string): Promise<string[]> {
  return await permissionController.getPermissionsByUserId(userId);
}

export async function getAllPermissions(): Promise<{ id: string; name: string }[]> {
  return await permissionController.getAllPermissions();
}
