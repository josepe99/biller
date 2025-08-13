"use server"

import { RoleController } from '../controllers/role.controller';

const roleController = new RoleController();

// Obtener todos los roles (puedes pasar true si quieres incluir permisos)
export async function getAllRolesAction(withPermissions: boolean = false) {
  return roleController.getAll(withPermissions);
}

// Crear un rol (ahora usa permissionsToAdd)
export async function createRoleAction(data: { name: string; description?: string; permissionsToAdd?: string[] }) {
  return roleController.create(data);
}

// Actualizar un rol (ahora usa permissionsToAdd y permissionsToRemove)
export async function updateRoleAction(
  id: string,
  data: { name?: string; description?: string; permissionsToAdd?: string[]; permissionsToRemove?: string[] }
) {
  return roleController.update(id, data);
}
