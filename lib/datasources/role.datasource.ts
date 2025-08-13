// Role Datasource - CRUD (except delete), with permissions management
import { prisma } from '../prisma';

export class RoleDatasource {
  // Get all roles (sin permisos)
  async getAll() {
    return prisma.role.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  // Get a single role by id (sin permisos)
  async getById(id: string) {
    return prisma.role.findUnique({
      where: { id },
    });
  }

  // Obtener permisos de un rol
  async getPermissions(roleId: string) {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId, deletedAt: null },
      include: { permission: true },
    });
    return rolePermissions.map((rp) => rp.permission);
  }

  // Crear un nuevo rol
  async create(data: { name: string; description?: string }) {
    return prisma.role.create({ data });
  }

  // Actualizar un rol (nombre y/o descripción)
  async update(id: string, data: { name?: string; description?: string }) {
    return prisma.role.update({
      where: { id },
      data,
    });
  }

  // Reemplazar permisos de un rol: agregar y eliminar específicos
  async setPermissions(roleId: string, permissionsToAdd: string[], permissionsToRemove: string[]) {
    const now = new Date();
    // Soft delete de los permisos a eliminar
    if (permissionsToRemove && permissionsToRemove.length > 0) {
      await prisma.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: { in: permissionsToRemove },
          deletedAt: null,
        },
      });
    }
    // Agregar los nuevos permisos (solo si no existen y no están activos)
    if (permissionsToAdd && permissionsToAdd.length > 0) {
      for (const permissionId of permissionsToAdd) {
        const existing = await prisma.rolePermission.findFirst({
          where: { roleId, permissionId, deletedAt: null },
        });
        if (!existing) {
          await prisma.rolePermission.create({
            data: {
              roleId,
              permissionId,
              grantedAt: now,
              createdAt: now,
              updatedAt: now,
              deletedAt: null,
            },
          });
        }
      }
    }
    // Retornar los permisos actuales
    return this.getPermissions(roleId);
  }

  // No delete method (roles cannot be deleted)
}
