import { prisma } from '@/lib/prisma'
import { UserRoleAssignment } from '@prisma/client'

export class UserRoleAssignmentDatasource {
  async update(userId: string, roleId: string, assignedBy?: string) {
    await this.deleteByUserId(userId);
    return this.create(userId, roleId, assignedBy);
  }
  async getByUserId(userId: string): Promise<UserRoleAssignment | null> {
    return prisma.userRoleAssignment.findFirst({ where: { userId } })
  }

  async deleteByUserId(userId: string): Promise<number> {
    const deleted = await prisma.userRoleAssignment.deleteMany({ where: { userId } })
    return deleted.count
  }

  async create(userId: string, roleId: string, assignedBy?: string): Promise<UserRoleAssignment> {
    return prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId,
        assignedBy,
      },
    })
  }
}

export const userRoleAssignmentDatasource = new UserRoleAssignmentDatasource()
