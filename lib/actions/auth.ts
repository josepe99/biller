'use server'

import { SessionController } from '@/lib/controllers/session.controller'
import { loginUser, invalidateSession } from '@/lib/utils/auth'
import type { LoginRequest, LoginResponse } from '@/lib/types'
import type { AuthUser } from '@/lib/types'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'session_id'
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

    // Return session data for localStorage
    return {
      success: true,
      session: loginResult.session,
      user: loginResult.user
    }
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
 * Get user by session ID - Edge runtime compatible
 * Uses the edge-compatible session controller
 */
export async function getUserBySessionIdEdge(sessionId: string): Promise<AuthUser | null> {
  try {
    const sessionController = new SessionController()
    const session = await sessionController.getById(sessionId)
    console.log('0️⃣0️⃣0️⃣0️⃣0️⃣0️⃣: ', session)

    if (!session || !session.user) {
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