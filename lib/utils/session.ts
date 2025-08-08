import type { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserBySessionId, extendSession, needsRefresh } from './auth'
import type { AuthUser } from '../types'

const SESSION_COOKIE_NAME = 'session_id'
const COOKIE_MAX_AGE = 60 * 60 // 1 hour

/**
 * Set session cookie
 */
export function setSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  })
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME)
}

/**
 * Get session ID from request cookies
 */
export function getSessionIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value || null
}

/**
 * Get session ID from server cookies
 */
export async function getSessionIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null
}

/**
 * Get current authenticated user from session
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const sessionId = await getSessionIdFromCookies()
    
    if (!sessionId) {
      return null
    }

    // Check if session needs refresh
    if (await needsRefresh(sessionId)) {
      // Auto-extend session if it needs refresh
      await extendSession(sessionId)
    }

    return await getUserBySessionId(sessionId)
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Middleware helper to check authentication
 */
export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser | null; sessionId: string | null }> {
  const sessionId = getSessionIdFromRequest(request)
  
  if (!sessionId) {
    return { user: null, sessionId: null }
  }

  const user = await getUserBySessionId(sessionId)
  
  if (!user) {
    return { user: null, sessionId: null }
  }

  // Auto-extend session if needed
  if (await needsRefresh(sessionId)) {
    await extendSession(sessionId)
  }

  return { user, sessionId }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, requiredRole: 'ADMIN' | 'MANAGER' | 'CASHIER'): boolean {
  const roleHierarchy = {
    'ADMIN': 3,
    'MANAGER': 2,
    'CASHIER': 1
  }

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

/**
 * Server component helper to get user or redirect
 */
export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  return await getCurrentUser()
}
