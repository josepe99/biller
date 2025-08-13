import { Role } from '@prisma/client'

export interface RoleType {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}
