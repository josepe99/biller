import { SessionController } from '../controllers/session.controller'
import { getUserBySessionIdFetch } from './session-fetch'
import { extendSessionAction } from '@/lib/actions/auth'
import type { AuthUser, Session } from '../types'

// Constants for security
const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const sessionController = new SessionController()

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
