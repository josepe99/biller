'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AuthUser, Session } from '@/lib/types'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  sessionId: string | null
  isLoading: boolean
  isAuthenticated: boolean
  setAuthData: (user: AuthUser, sessionId: string) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load auth data from localStorage on mount
    try {
      const storedSessionId = localStorage.getItem('sessionId')
      const storedUser = localStorage.getItem('user')

      if (storedSessionId) {
        setSessionId(storedSessionId)
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error loading auth data from localStorage:', error)
      // Clear invalid data
      localStorage.removeItem('sessionId')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
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

  const isAuthenticated = !!sessionId && !!user

  const value: AuthContextType = {
    user,
    session,
    sessionId,
    isLoading,
    isAuthenticated,
    setAuthData,
    clearAuth
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
