'use server'

import { SessionController } from '@/lib/controllers/session.controller'
import { loginUser, invalidateSession } from '@/lib/utils/auth'
import type { LoginRequest, LoginResponse } from '@/lib/types'
import type { AuthUser } from '@/lib/types'
import { cookies } from 'next/headers'

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

    console.log('permissions: ', loginResult.permissions)
    // Extraer permisos del loginResult (array de {resource, action})
    const permissionsArr = Array.isArray(loginResult.permissions) ? loginResult.permissions : [];
    // Generar lista de nombres de permisos tipo "resource:action"
    const permissionNames = permissionsArr.map(p => `${p.resource}:${p.action}`);

    // Guardar los nombres de los permisos en cookie (JSON string)
    cookieStore.set('permissions', JSON.stringify(permissionNames), {
      httpOnly: false, // Accessible from client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    });

    // Retornar también los permisos para localStorage
    return {
      success: true,
      session: loginResult.session,
      user: loginResult.user,
      permissions: permissionNames
    } as LoginResponse & { permissions: string[] };
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

/**
 * Server action for getting session by ID
 */
import { getUserPermissions } from '@/lib/utils/permissions'
import { userController } from '@/lib/controllers/user.controller'

export async function getSessionByIdAction(sessionId: string): Promise<{ success: boolean; user?: AuthUser; permissions?: string[]; error?: string }> {
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
    const userResp = await userController.getById(session.userId);
    if (!userResp.success || !userResp.data) {
      return { success: false, error: 'User not found' }
    }
    const user = Array.isArray(userResp.data) ? userResp.data[0] : userResp.data;

    // Obtener permisos del usuario
    const permissionsArr = await getUserPermissions(user.id);
    const permissionNames = permissionsArr.map(p => `${p.resource}:${p.action}`);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      permissions: permissionNames
    }
  } catch (error) {
    console.error('Error getting session:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Server action for validating session
 */
export async function validateSessionAction(sessionId: string): Promise<{ success: boolean; user?: AuthUser; permissions?: string[]; sessionExtended?: boolean; error?: string }> {
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
    const userResp = await userController.getById(session.userId);
    if (!userResp.success || !userResp.data) {
      return { success: false, error: 'User not found' }
    }
    const user = Array.isArray(userResp.data) ? userResp.data[0] : userResp.data;

    // Check if session needs to be extended (if it expires within the next 15 minutes)
    const now = new Date()
    const expiresAt = new Date(session.expiresAt)
    const timeUntilExpiry = expiresAt.getTime() - now.getTime()
    const fifteenMinutes = 15 * 60 * 1000
    const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
    let sessionExtended = false
    if (timeUntilExpiry < fifteenMinutes) {
      // Extend the session
      const newExpiresAt = new Date(Date.now() + SESSION_DURATION)
      const refreshBefore = new Date(Date.now() + (SESSION_DURATION * 0.8))
      await sessionController.extendSession(sessionId, newExpiresAt, refreshBefore)
      sessionExtended = true
    }

    // Obtener permisos del usuario
    const permissionsArr = await getUserPermissions(user.id);
    const permissionNames = permissionsArr.map(p => `${p.resource}:${p.action}`);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      sessionExtended,
      permissions: permissionNames
    }
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