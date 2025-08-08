import { User, Prisma, UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface CreateUserData {
  email: string
  name: string
  password: string
  role?: UserRole
}

export interface UpdateUserData {
  email?: string
  name?: string
  password?: string
  role?: UserRole
  loginAttempts?: number
  lockedUntil?: Date | null
  lastLoginAt?: Date
}

export interface UserFilters {
  includeDeleted?: boolean
  search?: string
  role?: UserRole
}

export interface UserSelectFields {
  id?: boolean
  email?: boolean
  name?: boolean
  password?: boolean
  role?: boolean
  loginAttempts?: boolean
  lockedUntil?: boolean
  lastLoginAt?: boolean
  deletedAt?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}

export class UserDatasource {
  /**
   * Create a new user
   */
  async create(data: CreateUserData): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        password: data.password,
        role: data.role || UserRole.CASHIER,
      },
    })
  }

  /**
   * Get all users (excluding soft deleted by default)
   */
  async getAll(filters: UserFilters = {}): Promise<User[]> {
    const { includeDeleted = false, search, role } = filters

    const where: Prisma.UserWhereInput = {}

    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Add role filter if provided
    if (role) {
      where.role = role
    }

    if (includeDeleted) {
      return await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
    } else {
      return await prisma.user.findMany({
        where: {
          ...where,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      })
    }
  }

  /**
   * Get user by ID
   */
  async getById(id: string, select?: UserSelectFields): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: select || undefined,
    })
  }

  /**
   * Get user by email with custom select fields
   */
  async getByEmail(email: string, select?: UserSelectFields): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: select || undefined,
    })
  }

  /**
   * Update user by ID
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {}

    if (data.email) updateData.email = data.email.toLowerCase()
    if (data.name) updateData.name = data.name
    if (data.password) updateData.password = data.password
    if (data.role) updateData.role = data.role
    if (data.loginAttempts !== undefined) updateData.loginAttempts = data.loginAttempts
    if (data.lockedUntil !== undefined) updateData.lockedUntil = data.lockedUntil
    if (data.lastLoginAt) updateData.lastLoginAt = data.lastLoginAt

    return await prisma.user.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * Soft delete user by ID
   */
  async softDelete(id: string): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  /**
   * Restore soft deleted user by ID
   */
  async restore(id: string): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    })
  }

  /**
   * Hard delete user by ID
   */
  async delete(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    })
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })
    return user !== null
  }

  /**
   * Increment login attempts for a user
   */
  async incrementLoginAttempts(id: string, lockTime?: number): Promise<User> {
    const user = await this.getById(id, { loginAttempts: true })
    if (!user) throw new Error('User not found')

    const newAttempts = user.loginAttempts + 1
    const updateData: UpdateUserData = { loginAttempts: newAttempts }

    // Lock account if lockTime is provided and max attempts reached
    if (lockTime && newAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + lockTime)
    }

    return await this.update(id, updateData)
  }

  /**
   * Reset login attempts for a user
   */
  async resetLoginAttempts(id: string): Promise<User> {
    return await this.update(id, {
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    })
  }

  /**
   * Update user login attempts and lock status
   */
  async updateLoginAttempts(id: string, attempts: number, lockUntil?: Date): Promise<User> {
    return await this.update(id, {
      loginAttempts: attempts,
      lockedUntil: lockUntil || null,
    })
  }

  /**
   * Update user last login time and reset login attempts
   */
  async updateSuccessfulLogin(id: string): Promise<User> {
    return await this.update(id, {
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    })
  }
}

// Export a singleton instance
export const userDatasource = new UserDatasource()
