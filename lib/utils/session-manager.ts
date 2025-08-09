'use client'

/**
 * Session Manager - Handles client-side session validation and refresh
 */
export class SessionManager {
  private static instance: SessionManager
  private validationInterval: NodeJS.Timeout | null = null
  private isValidating: boolean = false
  
  // Validation every 5 minutes
  private readonly VALIDATION_INTERVAL = 5 * 60 * 1000
  
  // Refresh session when it has less than 15 minutes left
  private readonly REFRESH_THRESHOLD = 15 * 60 * 1000

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  /**
   * Start session validation
   */
  startValidation(onSessionInvalid?: () => void, onSessionRefreshed?: (user: any) => void) {
    this.stopValidation() // Stop any existing validation

    const validate = async () => {
      if (this.isValidating) return

      const sessionId = localStorage.getItem('sessionId')
      if (!sessionId) {
        onSessionInvalid?.()
        return
      }

      this.isValidating = true

      try {
        const response = await fetch('/api/auth/validate-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
          credentials: 'include'
        })

        const result = await response.json()

        if (!result.success) {
          // Session is invalid
          this.clearSession()
          onSessionInvalid?.()
          return
        }

        // Update user data if received
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user))
          onSessionRefreshed?.(result.user)
        }

      } catch (error) {
        console.error('Session validation error:', error)
        // Don't clear session on network errors
      } finally {
        this.isValidating = false
      }
    }

    // Immediate validation
    validate()

    // Set up periodic validation
    this.validationInterval = setInterval(validate, this.VALIDATION_INTERVAL)
  }

  /**
   * Stop session validation
   */
  stopValidation() {
    if (this.validationInterval) {
      clearInterval(this.validationInterval)
      this.validationInterval = null
    }
  }

  /**
   * Manually validate session
   */
  async validateSession(): Promise<{ success: boolean; user?: any; error?: string }> {
    const sessionId = localStorage.getItem('sessionId')
    if (!sessionId) {
      return { success: false, error: 'No session found' }
    }

    try {
      const response = await fetch('/api/auth/validate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      return result
    } catch (error) {
      console.error('Manual session validation error:', error)
      return { success: false, error: 'Validation failed' }
    }
  }

  /**
   * Clear session data
   */
  clearSession() {
    localStorage.removeItem('sessionId')
    localStorage.removeItem('user')
  }

  /**
   * Check if session exists
   */
  hasSession(): boolean {
    return !!localStorage.getItem('sessionId')
  }

  /**
   * Get stored user data
   */
  getUser(): any | null {
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()
