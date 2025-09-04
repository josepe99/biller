"use server"

import { RoleController } from '../controllers/role.controller';
import { AuthController } from '../controllers/auth.controller';

const roleController = new RoleController();
const authController = new AuthController();

// Obtener todos los roles (puedes pasar true si quieres incluir permisos)
export async function getAllRolesAction(sessionId: string, withPermissions: boolean = false) {
  const perms = await authController.getPermissionsBySessionId(sessionId);
  if (!perms.includes('roles:read') && !perms.includes('roles:manage')) {
    throw new Error('Unauthorized');
  }
  return roleController.getAll(withPermissions);
}

// Crear un rol (ahora usa permissionsToAdd)
export async function createRoleAction(
  sessionId: string,
  data: { name: string; description?: string; permissionsToAdd?: string[] }
) {
  const perms = await authController.getPermissionsBySessionId(sessionId);
  if (!perms.includes('roles:create') && !perms.includes('roles:manage')) {
    throw new Error('Unauthorized');
  }
  return roleController.create(data);
}

// Actualizar un rol (ahora usa permissionsToAdd y permissionsToRemove)
export async function updateRoleAction(
  sessionId: string,
  id: string,
  data: { name?: string; description?: string; permissionsToAdd?: string[]; permissionsToRemove?: string[] }
) {
  const perms = await authController.getPermissionsBySessionId(sessionId);
  if (!perms.includes('roles:update') && !perms.includes('roles:manage')) {
    throw new Error('Unauthorized');
  }
  return roleController.update(id, data);
}
