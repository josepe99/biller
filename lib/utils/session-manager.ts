'use client'

/**
 * Session Manager - Handles client-side session validation and refresh
 */
export class SessionManager {
  private static instance: SessionManager
  private validationInterval: NodeJS.Timeout | null = null
  private isValidating: boolean = false
  private isValidationStarted: boolean = false // Prevent multiple starts
  private validationCount: number = 0 // Debug counter
  private lastValidationTime: number = 0 // Track last validation time
  
  // Validation every 30 minutes (much more conservative)
  private readonly VALIDATION_INTERVAL = 30 * 60 * 1000
  
  // Minimum time between validations (prevent rapid calls)
  private readonly MIN_VALIDATION_INTERVAL = 2 * 60 * 1000 // 2 minutes
  
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
    // Prevent multiple validation timers
    if (this.isValidationStarted) {
      console.log('Session validation already started, skipping...')
      return
    }

    this.stopValidation() // Stop any existing validation
    this.isValidationStarted = true

    const validate = async () => {
      if (this.isValidating) {
        console.log('Session validation already in progress, skipping...')
        return
      }

      // Check minimum interval between validations
      const now = Date.now()
      if (now - this.lastValidationTime < this.MIN_VALIDATION_INTERVAL) {
        console.log('Too soon since last validation, skipping...')
        return
      }

      const sessionId = localStorage.getItem('sessionId')
      if (!sessionId) {
        onSessionInvalid?.()
        return
      }

      this.isValidating = true
      this.validationCount++
      this.lastValidationTime = now
      console.log(`Session validation #${this.validationCount} starting...`)

      try {
        const response = await fetch('/api/auth/validate-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
          credentials: 'include'
        })

        // Check if response is OK and has JSON content type
        if (!response.ok) {
          console.error('Session validation failed with status:', response.status, response.statusText)
          if (response.status === 401) {
            // Unauthorized - clear session
            this.clearSession()
            onSessionInvalid?.()
          }
          return
        }

        // Check content type to ensure it's JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Session validation returned non-JSON response:', contentType)
          const text = await response.text()
          console.error('Response body:', text.substring(0, 200) + '...')
          return
        }

        const result = await response.json()

        console.log(`Session validation #${this.validationCount} completed:`, result.success ? 'SUCCESS' : 'FAILED')

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
        // Don't clear session on network errors unless it's a parsing error
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
          console.error('JSON parsing error - likely received HTML instead of JSON')
        }
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
    this.isValidationStarted = false // Reset the flag
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
