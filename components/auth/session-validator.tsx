'use client'

import { useSessionValidation } from '@/hooks/use-session-validation'
import { useAuth } from './auth-provider'

/**
 * Session Validator Component
 * Only validates sessions for authenticated users
 * Should be used in authenticated layouts/pages
 */
export function SessionValidator() {
  const { isAuthenticated, isLoading } = useAuth()
  
  // Only initialize session validation for authenticated users
  if (!isLoading && isAuthenticated) {
    useSessionValidation()
  }
  
  return null // This component doesn't render anything
}
