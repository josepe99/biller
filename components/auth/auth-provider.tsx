'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getPermissionsBySessionIdAction } from '@/lib/actions/auth'
import { validateSessionAction } from '@/lib/actions/session'
import type { AuthUser, Session } from '@/lib/types'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  sessionId: string | null
  isLoading: boolean
  isAuthenticated: boolean
  permissions: string[]
  setAuthData: (user: AuthUser, sessionId: string) => void
  clearAuth: () => void
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Al montar, valida la sesión y carga el usuario desde el backend
    const initializeAuth = async () => {
      try {
        const storedSessionId = localStorage.getItem('sessionId')
        if (storedSessionId) {
          setSessionId(storedSessionId)
          // Valida la sesión y obtiene el usuario real
          const validationResult = await validateSessionAction(storedSessionId)
          if (validationResult.success && validationResult.user) {
            setUser(validationResult.user)
            localStorage.setItem('user', JSON.stringify(validationResult.user))
            // Cargar permisos
            const perms = await getPermissionsBySessionIdAction(storedSessionId)
            setPermissions(perms || [])
            localStorage.setItem('permissions', JSON.stringify(perms || []))
          } else {
            // Sesión inválida
            setUser(null)
            setSessionId(null)
            setPermissions([])
            localStorage.removeItem('sessionId')
            localStorage.removeItem('user')
            localStorage.removeItem('permissions')
          }
        } else {
          setUser(null)
          setSessionId(null)
          setPermissions([])
        }
      } catch (error) {
        console.error('Error validating session on mount:', error)
        setUser(null)
        setSessionId(null)
        setPermissions([])
        localStorage.removeItem('sessionId')
        localStorage.removeItem('user')
        localStorage.removeItem('permissions')
      } finally {
        setIsLoading(false)
      }
    }
    initializeAuth()
  }, [])

  const setAuthData = async (userData: AuthUser, sessionIdData: string) => {
  setUser(userData)
  setSessionId(sessionIdData)
  localStorage.setItem('user', JSON.stringify(userData))
  localStorage.setItem('sessionId', sessionIdData)
  // Cargar permisos usando getPermissionsBySessionIdAction
  const perms = await getPermissionsBySessionIdAction(sessionIdData)
  setPermissions(perms || [])
  localStorage.setItem('permissions', JSON.stringify(perms || []))
  }

  const clearAuth = () => {
    setUser(null)
    setSession(null)
    setSessionId(null)
    setPermissions([])
    localStorage.removeItem('sessionId')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
  }

  const refreshAuth = async () => {
    if (sessionId) {
      try {
        const validationResult = await validateSessionAction(sessionId)
        if (validationResult.success && validationResult.user) {
          setUser(validationResult.user)
          localStorage.setItem('user', JSON.stringify(validationResult.user))
          // Refrescar permisos usando getPermissionsBySessionIdAction
          const perms = await getPermissionsBySessionIdAction(sessionId)
          setPermissions(perms || [])
          localStorage.setItem('permissions', JSON.stringify(perms || []))
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
    permissions,
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
