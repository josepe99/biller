import { randomBytes, createHash } from 'crypto'
import { prismaEdge } from '../prisma-edge'
import type { AuthUser, Session } from '../types'

// Constants for security
const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Get user by session ID - Edge runtime compatible
 * Uses standard Prisma queries without extensions
 */
export async function getUserBySessionIdEdge(sessionId: string): Promise<AuthUser | null> {
  try {
    const session = await prismaEdge.session.findUnique({
      where: { 
        id: sessionId,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            deletedAt: true
          }
        }
      }
    })

    if (!session || !session.user || session.user.deletedAt) {
      return null
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role
    }
  } catch (error) {
    console.error('Error getting user by session ID:', error)
    return null
  }
}

/**
 * Check if session needs refresh - Edge runtime compatible
 */
export function needsRefreshEdge(session: Session): boolean {
  const now = new Date()
  return session.refreshBefore && now >= session.refreshBefore
}

/**
 * Extend session - Edge runtime compatible
 */
export async function extendSessionEdge(sessionId: string): Promise<boolean> {
  try {
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION)
    const refreshBefore = new Date(Date.now() + (SESSION_DURATION * 0.8)) // Refresh at 80% of session time

    await prismaEdge.session.update({
      where: { 
        id: sessionId
      },
      data: {
        expiresAt: newExpiresAt,
        refreshBefore,
        updatedAt: new Date()
      }
    })

    return true
  } catch (error) {
    console.error('Error extending session:', error)
    return false
  }
}

/**
 * Calculate refresh before date (80% of session duration)
 */
export function calculateRefreshBeforeDateEdge(): Date {
  const now = new Date()
  return new Date(now.getTime() + (SESSION_DURATION * 0.8))
}
