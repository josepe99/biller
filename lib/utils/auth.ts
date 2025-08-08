import { randomBytes, createHash } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../prisma'
import type { LoginRequest, LoginResponse, AuthUser, Session } from '../types'

// Constants for security
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const REFRESH_BEFORE_DURATION = 15 * 60 * 1000 // 15 minutes before expiration

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
  return user.loginAttempts >= MAX_LOGIN_ATTEMPTS && 
         user.lockedUntil !== null && 
         user.lockedUntil !== undefined && 
         user.lockedUntil > new Date()
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
  const refreshBefore = new Date(expiresAt.getTime() - REFRESH_BEFORE_DURATION)

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
      refreshBefore,
      userAgent,
      ipAddress,
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

  return session as Session
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

  if (!session || !session.isActive || session.expiresAt < new Date()) {
    if (session) {
      // Deactivate expired session
      await prisma.session.update({
        where: { id: session.id },
        data: { isActive: false }
      })
    }
    return null
  }

  return session as Session
}

/**
 * Invalidate a session (logout)
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { id: sessionId },
    data: { isActive: false }
  })
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId },
    data: { isActive: false }
  })
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
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
 * Login user with email and password
 */
export async function loginUser(
  credentials: LoginRequest,
  userAgent?: string,
  ipAddress?: string
): Promise<LoginResponse> {
  try {
    const { email, password } = credentials

    // Find user by email with all necessary fields
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        loginAttempts: true,
        lockedUntil: true,
        lastLoginAt: true,
        deletedAt: true,
      }
    })

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

    return {
      success: true,
      user: authUser,
      session
    }

  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'An error occurred during login' }
  }
}

/**
 * Extend session expiration
 */
export async function extendSession(sessionId: string): Promise<boolean> {
  const session = await getSessionById(sessionId)
  
  if (!session) {
    return false
  }

  const now = new Date()
  const newExpiresAt = new Date(now.getTime() + SESSION_DURATION)
  const newRefreshBefore = new Date(newExpiresAt.getTime() - REFRESH_BEFORE_DURATION)
  
  await prisma.session.update({
    where: { id: session.id },
    data: { 
      expiresAt: newExpiresAt,
      refreshBefore: newRefreshBefore
    }
  })

  return true
}

/**
 * Check if session needs refresh
 */
export async function needsRefresh(sessionId: string): Promise<boolean> {
  const session = await getSessionById(sessionId)
  
  if (!session) {
    return false
  }

  return session.refreshBefore <= new Date()
}

/**
 * Get user by session ID
 */
export async function getUserBySessionId(sessionId: string): Promise<AuthUser | null> {
  const session = await getSessionById(sessionId)
  
  if (!session || !session.user) {
    return null
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role
  }
}
