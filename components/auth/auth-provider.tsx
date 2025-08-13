'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getPermissionsBySessionIdAction } from '@/lib/actions/auth'
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
    // Al montar, carga el usuario y permisos desde localStorage
    const initializeAuth = async () => {
      try {
        const storedSessionId = localStorage.getItem('sessionId')
        const storedUser = localStorage.getItem('user')
        const storedPermissions = localStorage.getItem('permissions')
        if (storedSessionId) {
          setSessionId(storedSessionId)
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions))
        }
      } catch (error) {
        console.error('Error loading auth data from localStorage:', error)
        setUser(null)
        setSessionId(null)
        setPermissions([])
  
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
        // Refrescar permisos usando getPermissionsBySessionIdAction
        const perms = await getPermissionsBySessionIdAction(sessionId)
        setPermissions(perms || [])
        localStorage.setItem('permissions', JSON.stringify(perms || []))
      } catch (error) {
        console.error('Error refreshing permissions:', error)
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
