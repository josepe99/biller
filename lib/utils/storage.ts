'use client'

import type { AuthUser } from '@/lib/types'

/**
 * Get session ID from localStorage
 */
export function getSessionIdFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return localStorage.getItem('sessionId')
  } catch (error) {
    console.error('Error getting session ID from localStorage:', error)
    return null
  }
}

/**
 * Get user data from localStorage
 */
export function getUserFromStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error getting user data from localStorage:', error)
    return null
  }
}

/**
 * Set session data in localStorage
 */
export function setSessionData(sessionId: string, user: AuthUser): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('sessionId', sessionId)
    localStorage.setItem('user', JSON.stringify(user))
  } catch (error) {
    console.error('Error setting session data in localStorage:', error)
  }
}

/**
 * Clear session data from localStorage
 */
export function clearSessionData(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('sessionId')
    localStorage.removeItem('user')
  } catch (error) {
    console.error('Error clearing session data from localStorage:', error)
  }
}

/**
 * Check if user is authenticated based on localStorage
 */
export function isAuthenticated(): boolean {
  const sessionId = getSessionIdFromStorage()
  const user = getUserFromStorage()
  return !!(sessionId && user)
}
