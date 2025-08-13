import { userRoleAssignmentDatasource } from '@/lib/datasources/userRoleAssignment.datasource'
import { UserRoleAssignment } from '@prisma/client'

export class UserRoleAssignmentController {
  async create(userId: string, roleId: string, assignedBy?: string) {
    return userRoleAssignmentDatasource.create(userId, roleId, assignedBy);
  }

  async deleteByUserId(userId: string) {
    return userRoleAssignmentDatasource.deleteByUserId(userId);
  }
  async updateUserRole(userId: string, newRoleId: string, assignedBy?: string): Promise<UserRoleAssignment | null> {
    // Eliminar el rol anterior
    await userRoleAssignmentDatasource.deleteByUserId(userId)
    // Crear el nuevo rol
    return await userRoleAssignmentDatasource.create(userId, newRoleId, assignedBy)
  }

  async getUserRole(userId: string): Promise<UserRoleAssignment | null> {
    return userRoleAssignmentDatasource.getByUserId(userId)
  }
}

export const userRoleAssignmentController = new UserRoleAssignmentController()
