import { Session, UserRole } from '@prisma/client'
import { 
  SessionDatasource, 
  CreateSessionData, 
  SessionFilters,
} from '@/lib/datasources/session.datasource'

export interface SessionResponse {
  success: boolean
  data?: Session | Session[]
  message?: string
  error?: string
}

export class SessionController {
  private sessionDatasource: SessionDatasource
  constructor() {
    this.sessionDatasource = new SessionDatasource()
  }

  /**
   * Get session by ID with user data
   */
  async getById(sessionId: string) {
    try {
      if (!sessionId || sessionId.trim() === '') {
        return null
      }

      return await this.sessionDatasource.getById(sessionId.trim())
    } catch (error) {
      console.error('Error fetching session with user:', error)
      return null
    }
  }

  /**
   * Create a new session
   */
  async createSession(
    userId: string, 
    expiresAt: Date, 
    refreshBefore: Date,
    userAgent?: string, 
    ipAddress?: string
  ): Promise<Session> {
    try {
      if (!userId || userId.trim() === '') {
        throw new Error('User ID is required')
      }

      const sessionData: CreateSessionData = {
        userId: userId.trim(),
        expiresAt,
        refreshBefore,
        userAgent,
        ipAddress,
      }

      return await this.sessionDatasource.create(sessionData)
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    }
  }

  /**
   * Get session by ID with user data
   */
  async getSessionById(sessionId: string): Promise<Session | null> {
    try {
      if (!sessionId || sessionId.trim() === '') {
        return null
      }

      const session = await this.sessionDatasource.getById(sessionId.trim())

      // Check if session is valid (active and not expired)
      if (session && (!session.isActive || session.expiresAt < new Date())) {
        // Deactivate expired session
        if (session.isActive) {
          await this.deactivateSession(session.id)
        }
        return null
      }

      return session
    } catch (error) {
      console.error('Error fetching session:', error)
      return null
    }
  }

  /**
   * Validate and get active session
   */
  async validateSession(sessionId: string): Promise<Session | null> {
    try {
      const session = await this.getSessionById(sessionId)
      
      if (!session) {
        return null
      }

      // Double check if session is still valid
      if (!session.isActive || session.expiresAt < new Date()) {
        await this.deactivateSession(session.id)
        return null
      }

      return session
    } catch (error) {
      console.error('Error validating session:', error)
      return null
    }
  }

  /**
   * Deactivate a session (logout)
   */
  async deactivateSession(sessionId: string): Promise<SessionResponse> {
    try {
      if (!sessionId || sessionId.trim() === '') {
        return {
          success: false,
          error: 'Session ID is required',
        }
      }

      await this.sessionDatasource.deactivate(sessionId.trim())

      return {
        success: true,
        message: 'Session deactivated successfully',
      }
    } catch (error) {
      console.error('Error deactivating session:', error)
      return {
        success: false,
        error: 'Failed to deactivate session',
      }
    }
  }

  /**
   * Deactivate all sessions for a user
   */
  async deactivateAllUserSessions(userId: string): Promise<SessionResponse> {
    try {
      if (!userId || userId.trim() === '') {
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      const count = await this.sessionDatasource.deactivateAllUserSessions(userId.trim())

      return {
        success: true,
        message: `${count} sessions deactivated successfully`,
      }
    } catch (error) {
      console.error('Error deactivating user sessions:', error)
      return {
        success: false,
        error: 'Failed to deactivate user sessions',
      }
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      return await this.sessionDatasource.deleteExpiredSessions()
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error)
      return 0
    }
  }

  /**
   * Extend session expiration
   */
  async extendSession(sessionId: string, expiresAt: Date, refreshBefore: Date): Promise<boolean> {
    try {
      const session = await this.getSessionById(sessionId)
      
      if (!session) {
        return false
      }

      await this.sessionDatasource.updateExpiration(session.id, expiresAt, refreshBefore)
      return true
    } catch (error) {
      console.error('Error extending session:', error)
      return false
    }
  }

  /**
   * Check if session needs refresh
   */
  async needsRefresh(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSessionById(sessionId)
      
      if (!session) {
        return false
      }

      return session.refreshBefore <= new Date()
    } catch (error) {
      console.error('Error checking session refresh:', error)
      return false
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string, filters: SessionFilters = {}): Promise<SessionResponse> {
    try {
      if (!userId || userId.trim() === '') {
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      const sessions = await this.sessionDatasource.getAllByUserId(userId.trim(), filters)

      return {
        success: true,
        data: sessions,
      }
    } catch (error) {
      console.error('Error fetching user sessions:', error)
      return {
        success: false,
        error: 'Failed to fetch user sessions',
      }
    }
  }

  /**
   * Check if session exists and is valid
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    try {
      if (!sessionId || sessionId.trim() === '') {
        return false
      }

      return await this.sessionDatasource.exists(sessionId.trim())
    } catch (error) {
      console.error('Error checking session existence:', error)
      return false
    }
  }
}
