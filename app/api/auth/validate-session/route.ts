import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserBySessionIdEdge, extendSessionEdge } from '@/lib/utils/auth-edge'

const SESSION_COOKIE_NAME = 'session_id'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    const cookieStore = await cookies()
    const cookieSessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
    
    // Use sessionId from request body or cookie
    const activeSessionId = sessionId || cookieSessionId
    
    if (!activeSessionId) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      )
    }

    // Validate session against database
    const user = await getUserBySessionIdEdge(activeSessionId)
    
    if (!user) {
      // Clear invalid cookie if it exists
      if (cookieSessionId) {
        const response = NextResponse.json(
          { success: false, error: 'Invalid session' },
          { status: 401 }
        )
        response.cookies.delete(SESSION_COOKIE_NAME)
        return response
      }
      
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Try to extend session
    const extended = await extendSessionEdge(activeSessionId)
    
    // Update cookie if session was extended
    const response = NextResponse.json({
      success: true,
      user,
      sessionExtended: extended
    })

    if (extended) {
      response.cookies.set(SESSION_COOKIE_NAME, activeSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/'
      })
    }

    return response
  } catch (error) {
    console.error('Session validation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Session validation failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
