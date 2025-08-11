'use server'

import { cookies } from 'next/headers'
import { getUserBySessionId, extendSession } from '@/lib/utils/auth'
import type { AuthUser } from '@/lib/types'

const SESSION_COOKIE_NAME = 'sessionId'

/**
 * Validate session server action
 * Checks both cookie and localStorage sessionId against database
 */
export async function validateSessionAction(sessionId?: string): Promise<{
  success: boolean
  user?: AuthUser
  needsRefresh?: boolean
  error?: string
}> {
  try {
    const cookieStore = await cookies()
    const cookieSessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
    
    // Use sessionId from parameter (localStorage) or cookie, prefer localStorage
    const activeSessionId = sessionId || cookieSessionId
    
    if (!activeSessionId) {
      return { success: false, error: 'No session found' }
    }

    // Validate session against database
    const user = await getUserBySessionId(activeSessionId)
    
    if (!user) {
      // Clear invalid cookie if it exists
      if (cookieSessionId) {
        cookieStore.delete(SESSION_COOKIE_NAME)
      }
      return { success: false, error: 'Invalid session' }
    }

    // Try to extend session
    const extended = await extendSession(activeSessionId)
    
    return {
      success: true,
      user,
      needsRefresh: !extended
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return { success: false, error: 'Session validation failed' }
  }
}

/**
 * Refresh session server action
 */
export async function refreshSessionAction(sessionId: string): Promise<{
  success: boolean
  user?: AuthUser
  error?: string
}> {
  try {
    const user = await getUserBySessionId(sessionId)
    
    if (!user) {
      return { success: false, error: 'Invalid session' }
    }

    const extended = await extendSession(sessionId)
    
    if (!extended) {
      return { success: false, error: 'Failed to refresh session' }
    }

    // Update cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })

    return { success: true, user }
  } catch (error) {
    console.error('Session refresh error:', error)
    return { success: false, error: 'Session refresh failed' }
  }
}
