'use client'

import { useState, useEffect } from 'react'
import type { AuthUser, Session } from '@/lib/types'

interface UseAuthReturn {
  user: AuthUser | null
  session: Session | null
  sessionId: string | null
  isLoading: boolean
  isAuthenticated: boolean
  clearAuth: () => void
}

export function useAuth(): UseAuthReturn {
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

  const clearAuth = () => {
    setUser(null)
    setSession(null)
    setSessionId(null)
    localStorage.removeItem('sessionId')
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!sessionId && !!user

  return {
    user,
    session,
    sessionId,
    isLoading,
    isAuthenticated,
    clearAuth
  }
}
