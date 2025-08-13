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

  // Reemplazar todos los permisos de un rol
  async setPermissions(roleId: string, permissionIds: string[]) {
    // Eliminar los permisos actuales (soft delete)
    await prisma.rolePermission.updateMany({
      where: { roleId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    // Agregar los nuevos permisos
    const now = new Date();
    await Promise.all(
      permissionIds.map((permissionId) =>
        prisma.rolePermission.create({
          data: {
            roleId,
            permissionId,
            grantedAt: now,
            createdAt: now,
            updatedAt: now,
          },
        })
      )
    );
    // Retornar los permisos actuales
    return this.getPermissions(roleId);
  }

  // No delete method (roles cannot be deleted)
}
