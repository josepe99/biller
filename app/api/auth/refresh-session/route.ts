import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserBySessionIdEdge, extendSessionEdge } from '@/lib/utils/auth-edge'

const SESSION_COOKIE_NAME = 'session_id'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Validate session exists and is valid
    const user = await getUserBySessionIdEdge(sessionId)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Extend session
    const extended = await extendSessionEdge(sessionId)
    
    if (!extended) {
      return NextResponse.json(
        { success: false, error: 'Failed to refresh session' },
        { status: 500 }
      )
    }

    // Update cookie
    const cookieStore = await cookies()
    const response = NextResponse.json({
      success: true,
      user,
      message: 'Session refreshed successfully'
    })

    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Session refresh API error:', error)
    return NextResponse.json(
      { success: false, error: 'Session refresh failed' },
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
