'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AuthUser, Session } from '@/lib/types'
import { validateSessionAction } from '@/lib/actions/session'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  sessionId: string | null
  isLoading: boolean
  isAuthenticated: boolean
  setAuthData: (user: AuthUser, sessionId: string) => void
  clearAuth: () => void
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load auth data from localStorage on mount and validate session
    const initializeAuth = async () => {
      try {
        const storedSessionId = localStorage.getItem('sessionId')
        const storedUser = localStorage.getItem('user')

        if (storedSessionId && storedUser) {
          // Validate stored session
          const validationResult = await validateSessionAction(storedSessionId)
          
          if (validationResult.success && validationResult.user) {
            setSessionId(storedSessionId)
            setUser(validationResult.user)
            // Update stored user data in case it changed
            localStorage.setItem('user', JSON.stringify(validationResult.user))
          } else {
            // Clear invalid session data
            localStorage.removeItem('sessionId')
            localStorage.removeItem('user')
          }
        }
      } catch (error) {
        console.error('Error validating session on mount:', error)
        // Clear invalid data on error
        localStorage.removeItem('sessionId')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const setAuthData = (userData: AuthUser, sessionIdData: string) => {
    setUser(userData)
    setSessionId(sessionIdData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('sessionId', sessionIdData)
  }

  const clearAuth = () => {
    setUser(null)
    setSession(null)
    setSessionId(null)
    localStorage.removeItem('sessionId')
    localStorage.removeItem('user')
  }

  const refreshAuth = async () => {
    if (sessionId) {
      try {
        const validationResult = await validateSessionAction(sessionId)
        
        if (validationResult.success && validationResult.user) {
          setUser(validationResult.user)
          localStorage.setItem('user', JSON.stringify(validationResult.user))
        } else {
          clearAuth()
        }
      } catch (error) {
        console.error('Error refreshing auth:', error)
        clearAuth()
      }
    }
  }

  const isAuthenticated = !!sessionId && !!user

  const value: AuthContextType = {
    user,
    session,
    sessionId,
    isLoading,
    isAuthenticated,
    setAuthData,
    clearAuth,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
