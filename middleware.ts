import { NextRequest, NextResponse } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/welcome',
  '/login',
  '/register',
  '/unauthorized'
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

  // Check if sessionId exists in cookies
  const sessionId = request.cookies.get('sessionId')?.value
  console.log('Session ID from cookies: ', sessionId)

  // If no sessionId, redirect to welcome
  if (!sessionId) {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  // If sessionId exists, allow access
  return NextResponse.next()
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
