import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/session'

// Define public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/login',
  '/register',
  '/',
]

// Define admin-only routes
const adminRoutes = [
  '/admin',
  '/api/admin',
]

// Define manager+ routes (manager and admin)
const managerRoutes = [
  '/api/categories',
  '/api/products',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check authentication
  const { user, sessionId } = await requireAuth(request)

  if (!user || !sessionId) {
    // Redirect to login for protected routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  const isManagerRoute = managerRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isAdminRoute && user.role !== 'ADMIN') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (isManagerRoute && !['ADMIN', 'MANAGER'].includes(user.role)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Manager access required' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Add user info to headers for API routes
  const response = NextResponse.next()
  response.headers.set('x-user-id', user.id)
  response.headers.set('x-user-role', user.role)
  response.headers.set('x-session-id', sessionId)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\..*$).*)',
  ],
}
