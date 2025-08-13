'use client'

import { usePathname } from 'next/navigation'
import { ProtectedRoute } from './protected-route'

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
  // Log para depuración
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[AuthWrapper] pathname:', pathname)
  }

  // Forzar que '/' siempre sea protegida
  if (pathname === '/') {
    return (
      <ProtectedRoute requiredRoles={[]}>{children}</ProtectedRoute>
    )
  }

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return <>{children}</>
  }

  // Determine required roles based on the route
  let requiredRoles: string[] = []
  if (ADMIN_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    requiredRoles = ['ADMIN']
  } else if (MANAGER_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    requiredRoles = ['MANAGER', 'ADMIN']
  }

  return (
    <ProtectedRoute requiredRoles={requiredRoles}>
      {children}
    </ProtectedRoute>
  )
}
