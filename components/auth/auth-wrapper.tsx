'use client'

import { usePathname } from 'next/navigation'
import { ProtectedRoute } from './protected-route'
import { useSessionValidation } from '@/hooks/use-session-validation'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/welcome',
  '/login',
  '/register',
  '/unauthorized'
]

// Define admin-only routes
const ADMIN_ROUTES = [
  '/admin'
]

// Define manager+ routes (manager and admin)
const MANAGER_ROUTES = [
  '/stock'
]

interface AuthWrapperProps {
  children: React.ReactNode
}

/**
 * AuthWrapper component that automatically protects routes based on path
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  const pathname = usePathname()
  
  // Initialize session validation for authenticated users
  useSessionValidation()

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // If it's a public route, render children without protection
  if (isPublicRoute) {
    return <>{children}</>
  }

  // For the root path and all other protected routes, apply protection
  // Determine required roles based on the route
  let requiredRoles: string[] = []
  
  if (ADMIN_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    requiredRoles = ['ADMIN']
  } else if (MANAGER_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    requiredRoles = ['MANAGER', 'ADMIN']
  }
  // For the home page and other routes, require any authenticated user

  // For all protected routes, require authentication
  return (
    <ProtectedRoute requiredRoles={requiredRoles}>
      {children}
    </ProtectedRoute>
  )
}
