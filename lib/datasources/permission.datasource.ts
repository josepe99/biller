import { prisma } from '@/lib/prisma'

export class PermissionDatasource {
  /**
   * Obtiene los nombres de los permisos de un usuario (solo campo name)
   */
  async getPermissionsByUserId(userId: string): Promise<string[]> {
    // Buscar solo los nombres de los permisos asociados al usuario
    const userRoleAssignments = await prisma.userRoleAssignment.findMany({
      where: { userId, deletedAt: null },
      select: {
        role: {
          select: {
            rolePermissions: {
              where: { deletedAt: null },
              select: {
                permission: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    })

    // Extraer los nombres únicos de los permisos
    const names = new Set<string>()
    for (const ura of userRoleAssignments) {
      for (const rp of ura.role.rolePermissions) {
        if (rp.permission?.name) {
          names.add(rp.permission.name)
        }
      }
    }
    return Array.from(names)
  }

  /**
   * Obtiene todos los permisos disponibles (id y name)
   */
  async getAllPermissions(): Promise<{ id: string; name: string }[]> {
    const permissions = await prisma.permission.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true }
    });
    return permissions;
  }
}
