import { Session, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface CreateSessionData {
  userId: string
  expiresAt: Date
  refreshBefore: Date
  userAgent?: string
  ipAddress?: string
}

export interface UpdateSessionData {
  expiresAt?: Date
  refreshBefore?: Date
  isActive?: boolean
  userAgent?: string
  ipAddress?: string
}

export interface SessionFilters {
  userId?: string
  isActive?: boolean
  expired?: boolean
}

export interface SessionSelectFields {
  id?: boolean
  userId?: boolean
  expiresAt?: boolean
  refreshBefore?: boolean
  isActive?: boolean
  userAgent?: boolean
  ipAddress?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}

export class SessionDatasource {
  /**
   * Create a new session
   */
  async create(data: CreateSessionData): Promise<Session> {
    return await prisma.session.create({
      data: {
        userId: data.userId,
        expiresAt: data.expiresAt,
        refreshBefore: data.refreshBefore,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            loginAttempts: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    })
  }

  /**
   * Get session by ID with user data
   */
  async getById(sessionId: string): Promise<Session | null> {
    return await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            loginAttempts: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    })
  }

  /**
   * Get session by ID with custom select
   */
  async getByIdWithSelect(sessionId: string, select?: SessionSelectFields): Promise<Session | null> {
    return await prisma.session.findUnique({
      where: { id: sessionId },
      select: select || undefined,
    })
  }

  /**
   * Update session by ID
   */
  async update(sessionId: string, data: UpdateSessionData): Promise<Session> {
    const updateData: Prisma.SessionUpdateInput = {}

    if (data.expiresAt) updateData.expiresAt = data.expiresAt
    if (data.refreshBefore) updateData.refreshBefore = data.refreshBefore
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.userAgent) updateData.userAgent = data.userAgent
    if (data.ipAddress) updateData.ipAddress = data.ipAddress

    return await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
    })
  }

  /**
   * Deactivate session by ID
   */
  async deactivate(sessionId: string): Promise<Session> {
    return await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false }
    })
  }

  /**
   * Deactivate sessions by IDs
   */
  async deactivateMany(sessionIds: string[]): Promise<number> {
    const result = await prisma.session.updateMany({
      where: { id: { in: sessionIds } },
      data: { isActive: false }
    })
    return result.count
  }

  /**
   * Deactivate all sessions for a user
   */
  async deactivateAllUserSessions(userId: string): Promise<number> {
    const result = await prisma.session.updateMany({
      where: { userId },
      data: { isActive: false }
    })
    return result.count
  }

  /**
   * Delete expired and inactive sessions
   */
  async deleteExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false }
        ]
      }
    })
    return result.count
  }

  /**
   * Get all sessions for a user
   */
  async getAllByUserId(userId: string, filters: SessionFilters = {}): Promise<Session[]> {
    const { isActive, expired } = filters
    const where: Prisma.SessionWhereInput = { userId }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    if (expired !== undefined) {
      if (expired) {
        where.expiresAt = { lt: new Date() }
      } else {
        where.expiresAt = { gte: new Date() }
      }
    }

    return await prisma.session.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Check if session exists and is active
   */
  async exists(sessionId: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, isActive: true, expiresAt: true }
    })
    
    return session !== null && session.isActive && session.expiresAt > new Date()
  }

  /**
   * Update session expiration
   */
  async updateExpiration(sessionId: string, expiresAt: Date, refreshBefore: Date): Promise<Session> {
    return await prisma.session.update({
      where: { id: sessionId },
      data: { 
        expiresAt,
        refreshBefore
      }
    })
  }
}

// Export a singleton instance
export const sessionDatasource = new SessionDatasource()
