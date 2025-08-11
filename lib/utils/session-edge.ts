import { NextRequest, NextResponse } from 'next/server'
import { getUserBySessionId } from './auth-edge'
import { extendSession } from './auth-edge'
import type { AuthUser } from '../types'

const SESSION_COOKIE_NAME = 'sessionId'
const COOKIE_MAX_AGE = 60 * 60 // 1 hour

/**
 * Set session cookie
 */
export function setSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
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
 * Require authentication middleware
 */
export async function requireAuth(request: NextRequest): Promise<{
  user: AuthUser | null
  response: NextResponse | null
}> {
  const sessionId = getSessionIdFromRequest(request)
  
  if (!sessionId) {
    return {
      user: null,
      response: NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const user = await getUserBySessionId(sessionId)
  
  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    clearSessionCookie(response)
    return {
      user: null,
      response
    }
  }

  // Extend session if needed
  try {
    await extendSession(sessionId)
  } catch (error) {
    console.error('Failed to extend session:', error)
    // Continue without extending - session will expire naturally
  }

  return {
    user,
    response: null
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role)
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN'
}

/**
 * Check if user is manager or admin
 */
export function isManagerOrAdmin(user: AuthUser): boolean {
  return user.role === 'MANAGER' || user.role === 'ADMIN'
}
