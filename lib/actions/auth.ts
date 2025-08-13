'use server'

import { getUserPermissions } from '@/lib/utils/permissions'
import { prisma } from '@/lib/prisma'
import type { Session } from '@/lib/types'
import { SessionController } from '@/lib/controllers/session.controller'
import { loginUser, invalidateSession } from '@/lib/utils/auth'
import type { LoginRequest, LoginResponse } from '@/lib/types'
import type { AuthUser } from '@/lib/types'
import { cookies } from 'next/headers'
import { AuthController } from '../controllers/auth.controller'

const SESSION_COOKIE_NAME = 'sessionId'
const COOKIE_MAX_AGE = 60 * 60 // 1 hour

/**
 * Server action for user login
 */
export async function loginAction(email: string, password: string): Promise<LoginResponse> {
  try {
    if (!email || !password) {
      return { success: false, error: 'Correo electrónico y contraseña son requeridos' }
    }

    // Login user
    const loginResult = await loginUser(
      { email, password } as LoginRequest,
      undefined, // userAgent not available in server actions
      'server-action' // IP placeholder for server actions
    )

    if (!loginResult.success || !loginResult.session) {
      return loginResult
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, loginResult.session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    })

    return {
      success: true,
      session: loginResult.session,
      user: loginResult.user,
    };
  } catch (error) {
    console.error('Login action error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Server action for user logout
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionId) {
      // Invalidate the session in the database
      await invalidateSession(sessionId)
    }

    // Clear the session cookie
    cookieStore.delete(SESSION_COOKIE_NAME)

    return { success: true }
  } catch (error) {
    console.error('Logout action error:', error)
    return { success: false }
  }
}

export async function getSessionByIdAction(sessionId: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    if (!sessionId) {
      return { success: false, error: 'Session ID is required' }
    }

    const sessionController = new SessionController()
    const session = await sessionController.getById(sessionId)

    if (!session || !session.userId) {
      return { success: false, error: 'Session not found or expired' }
    }

  // Obtener usuario
  // Si necesitas retornar el usuario, implementa aquí la lógica, pero sin permisos
  return { success: false, error: 'Not implemented' }
  } catch (error) {
    console.error('Error getting session:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Server action for validating session
 */
export async function validateSessionAction(sessionId: string): Promise<{ success: boolean; user?: AuthUser; sessionExtended?: boolean; error?: string }> {
  try {
    if (!sessionId) {
      return { success: false, error: 'Session ID is required' }
    }

    const sessionController = new SessionController()
    const session = await sessionController.getById(sessionId)

    if (!session || !session.userId) {
      return { success: false, error: 'Session not found or expired' }
    }

  // Obtener usuario y lógica de extensión de sesión aquí, pero sin permisos
  return { success: false, error: 'Not implemented' }
  } catch (error) {
    console.error('Error validating session:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Server action for extending session
 */
export async function extendSessionAction(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sessionId) {
      return { success: false, error: 'Session ID is required' }
    }

    const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION)
    const refreshBefore = new Date(Date.now() + (SESSION_DURATION * 0.8)) // Refresh at 80% of session time

    const sessionController = new SessionController()
    await sessionController.extendSession(sessionId, newExpiresAt, refreshBefore)

    return { success: true }
  } catch (error) {
    console.error('Error extending session:', error)
    return { success: false, error: 'Internal server error' }
  }
}

export async function getPermissionsBySessionIdAction(sessionId: string): Promise<string[]> {
  const authController = new AuthController()
  return authController.getPermissionsBySessionId(sessionId)
}