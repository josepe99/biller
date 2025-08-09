'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { sessionManager } from '@/lib/utils/session-manager'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallbackPath?: string
  loadingComponent?: React.ReactNode
}

/**
 * ProtectedRoute component that validates authentication and authorization
 */
export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  fallbackPath = '/unauthorized',
  loadingComponent
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) return

      if (!isAuthenticated) {
        const currentPath = window.location.pathname
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        return
      }

      // Validate session on mount
      await sessionManager.validateSession()
      setIsValidating(false)
    }

    checkAuth()
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    // Check role-based access
    if (!isLoading && !isValidating && user && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(user.role)
      
      if (!hasRequiredRole) {
        router.push(fallbackPath)
        return
      }
    }
  }, [user, requiredRoles, fallbackPath, router, isLoading, isValidating])

  // Show loading state
  if (isLoading || isValidating) {
    return loadingComponent || <LoadingSpinner />
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null
  }

  // Check role-based access
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role)
    if (!hasRequiredRole) {
      return null // Will redirect in useEffect
    }
  }

  return <>{children}</>
}

/**
 * Default loading spinner component
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

/**
 * Higher-order component for protecting pages
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
