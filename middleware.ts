import { NextRequest, NextResponse } from 'next/server'
import { requireAuthEdge, hasRoleEdge, isAdminEdge, isManagerOrAdminEdge, setSessionCookie, clearSessionCookie } from '@/lib/utils/session-edge'
import { extendSessionEdge } from '@/lib/utils/auth-edge'

// Define public routes that don't require authentication
const publicRoutes = [
  '/api/auth', // Exclude all auth API routes to prevent circular dependencies
  '/welcome',
  '/login',
  '/register',
  '/unauthorized'
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
  '/stock'
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

  // Special handling for root path - redirect unauthenticated users to welcome
  if (pathname === '/') {
    const { user } = await requireAuthEdge(request)
    console.log('🔥🔥🔥🔥🔥🔥: ', user)
    if (!user) {
      return NextResponse.redirect(new URL('/welcome', request.url))
    }
    // If authenticated, continue to dashboard
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const { user, response: authResponse } = await requireAuthEdge(request)

  if (!user || authResponse) {
    // If there's an auth response (redirect), use it
    if (authResponse) {
      return authResponse
    }
    
    // Otherwise handle API vs page routes
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

  if (isAdminRoute && !isAdminEdge(user)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (isManagerRoute && !isManagerOrAdminEdge(user)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Manager access required' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Create response and add user info to headers for API routes
  const response = NextResponse.next()
  response.headers.set('x-user-id', user.id)
  response.headers.set('x-user-role', user.role)

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
