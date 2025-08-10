import type { LoginRequest, LoginResponse, AuthUser, Session } from '../types'
import { SessionController } from '@/lib/controllers/session.controller'
import { UserController } from '../controllers/user.controller'
import { calculateRefreshBeforeDate } from './session'
import bcrypt from 'bcryptjs'

const sessionController = new SessionController()
const userController = new UserController()

// Constants for security
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

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
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<any> {
  return await userController.findUserByEmail(email)
}

/**
 * Increment login attempts
 */
export async function incrementLoginAttempts(userId: string): Promise<void> {
  const userResponse = await userController.getById(userId, { loginAttempts: true })

  if (!userResponse.success || !userResponse.data) return

  const user = userResponse.data as any
  const newAttempts = user.loginAttempts + 1

  // Lock account if max attempts reached
  await userController.updateLoginAttempts(userId, newAttempts, newAttempts >= MAX_LOGIN_ATTEMPTS ? LOCK_TIME : undefined)
}

/**
 * Reset login attempts
 */
export async function resetLoginAttempts(userId: string): Promise<void> {
  await userController.resetLoginAttempts(userId)
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
  const refreshBefore = calculateRefreshBeforeDate() // 5 days from now

  return await sessionController.createSession(userId, expiresAt, refreshBefore, userAgent, ipAddress)
}

/**
 * Validate and get session by ID
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  return await sessionController.getSessionById(sessionId)
}

/**
 * Invalidate a session (logout)
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await sessionController.deactivateSession(sessionId)
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await sessionController.deactivateAllUserSessions(userId)
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  return await sessionController.cleanupExpiredSessions()
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

      // Update login attempts and potentially lock account
      await userController.updateLoginAttempts(user.id, newAttempts, LOCK_TIME)

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
    await userController.updateSuccessfulLogin(user.id)

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
  const newRefreshBefore = calculateRefreshBeforeDate() // 5 days from now
  
  return await sessionController.extendSession(session.id, newExpiresAt, newRefreshBefore)
}

/**
 * Check if session needs refresh
 */
export async function needsRefresh(sessionId: string): Promise<boolean> {
  return await sessionController.needsRefresh(sessionId)
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
