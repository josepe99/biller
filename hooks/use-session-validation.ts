'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { sessionManager } from '@/lib/utils/session-manager'
import { useRouter } from 'next/navigation'

export function useSessionValidation() {
  const { user, sessionId, clearAuth, setAuthData, isLoading } = useAuth()
  const router = useRouter()
  const isInitializedRef = useRef(false)

  const handleSessionInvalid = useCallback(() => {
    clearAuth()
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [clearAuth, router])

  const handleSessionRefreshed = useCallback((userData: any) => {
    if (sessionId) {
      setAuthData(userData, sessionId)
    }
  }, [sessionId, setAuthData])

  const validateSession = useCallback(async () => {
    if (!sessionId) return

    const result = await sessionManager.validateSession()
    
    if (!result.success) {
      handleSessionInvalid()
    } else if (result.user && sessionId) {
      setAuthData(result.user, sessionId)
    }
  }, [sessionId, handleSessionInvalid, setAuthData])

  // Initialize session validation when user is authenticated
  useEffect(() => {
    if (!isLoading && sessionId && !isInitializedRef.current) {
      sessionManager.startValidation(handleSessionInvalid, handleSessionRefreshed)
      isInitializedRef.current = true
    }

    // Cleanup on unmount or when session changes
    return () => {
      if (isInitializedRef.current) {
        sessionManager.stopValidation()
        isInitializedRef.current = false
      }
    }
  }, [isLoading, sessionId]) // Removed callback dependencies to prevent restarts

  // Stop validation when user logs out
  useEffect(() => {
    if (!sessionId && isInitializedRef.current) {
      sessionManager.stopValidation()
      isInitializedRef.current = false
    }
  }, [sessionId])

  return {
    validateSession,
    isValidating: false // SessionManager handles validation state internally
  }
}
