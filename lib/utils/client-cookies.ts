'use client'

/**
 * Utility to set session cookie from client side
 * This ensures synchronization between localStorage and cookies
 */
export function setSessionCookie(sessionId: string) {
  // Set cookie that expires in 1 hour
  const expires = new Date()
  expires.setTime(expires.getTime() + (60 * 60 * 1000)) // 1 hour
  document.cookie = `sessionId=${sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

/**
 * Utility to clear session cookie from client side
 */
export function clearSessionCookie() {
  document.cookie = 'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax'
}

/**
 * Get session cookie value
 */
export function getSessionCookie(): string | null {
  const cookies = document.cookie.split(';').map(c => c.trim())
  const sessionCookie = cookies.find(c => c.startsWith('sessionId='))
  return sessionCookie ? sessionCookie.split('=')[1] : null
}
