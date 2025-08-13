import type { AuthUser, Session, LoginRequest, LoginResponse } from '../types'
import { getUserPermissions } from '../utils/permissions'
import { SessionController } from '../controllers/session.controller'
import { userController } from '../controllers/user.controller'
import { getUserBySessionIdFetch } from './session-fetch'
import { extendSessionAction } from '@/lib/actions/auth'
import { prisma } from '../prisma'
import bcrypt from 'bcryptjs'

// Constants for security
const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
const sessionController = new SessionController()

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Check if user account is locked
 */
export function isAccountLocked(user: { loginAttempts: number; lockedUntil?: Date | null }): boolean {
  return user.lockedUntil ? user.lockedUntil > new Date() : false
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string, 
  userAgent?: string, 
  ipAddress?: string
): Promise<Session> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DURATION)
  const refreshBefore = calculateRefreshBeforeDate()

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
      refreshBefore,
      userAgent,
      ipAddress,
      deletedAt: null, // Asegura que la sesión se cree con deletedAt en null
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        }
      }
    }
  })

  return session as unknown as Session
}

/**
 * Validate and get session by ID
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        }
      }
    }
  })

  if (!session || session.deletedAt !== null || session.expiresAt < new Date()) {
    if (session && session.deletedAt === null && session.expiresAt < new Date()) {
      // Marcar como eliminada (soft delete) la sesión expirada
      await prisma.session.update({
        where: { id: session.id },
        data: { deletedAt: new Date() }
      })
    }
    return null
  }

  return session as unknown as Session
}

/**
 * Invalidate a session (logout)
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { id: sessionId },
    data: { deletedAt: new Date() }
  })
}

/**
 * Check if session needs refresh
 */
export function needsRefresh(session: Session): boolean {
  const now = new Date()
  return session.refreshBefore && now >= session.refreshBefore
}

/**
 * Extend session
 * Uses server action to handle the database update
 */
export async function extendSession(sessionId: string): Promise<boolean> {
  try {
    const result = await extendSessionAction(sessionId)
    return result.success || false
  } catch (error) {
    console.error('Error extending session:', error)
    return false
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(
  credentials: LoginRequest,
  userAgent?: string,
  ipAddress?: string
): Promise<LoginResponse> {
  try {
    const { email, password } = credentials

    // Find user by email using userController
    const user = await userController.findUserByEmail(email)

    if (!user || user.deletedAt) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Check if account is locked
    if (isAccountLocked(user)) {
      return { 
        success: false, 
        error: `Account is locked. Try again after ${user.lockedUntil?.toLocaleString()}` 
      }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1
      const updateData: any = { loginAttempts: newAttempts }

      // Lock account if max attempts reached
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_TIME)
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      })

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        return { 
          success: false, 
          error: 'Account locked due to too many failed login attempts' 
        }
      }

      return { 
        success: false, 
        error: `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.` 
      }
    }

    // Reset login attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    })

    // Create session
    const session = await createSession(user.id, userAgent, ipAddress)


    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    // Obtener permisos del usuario
    const permissionsObj = await getUserPermissions(user.id)
    // Si permissionsObj es un array de objetos { resource, action }, convertir a string[] tipo 'resource:action'
    const permissions = Array.isArray(permissionsObj)
      ? permissionsObj.map((p: any) => typeof p === 'string' ? p : `${p.resource}:${p.action}`)
      : [];

    return {
      success: true,
      user: authUser,
      session,
      permissions
    }

  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'An error occurred during login' }
  }
}

/**
 * Calculate refresh before date (80% of session duration)
 */
export function calculateRefreshBeforeDate(): Date {
  const now = new Date()
  return new Date(now.getTime() + (SESSION_DURATION * 0.8))
}

/**
 * Get user by session ID
 * Uses fetch to call API route that handles the database query
 */
export async function getUserBySessionId(sessionId: string): Promise<AuthUser | null> {
  return getUserBySessionIdFetch(sessionId)
}
