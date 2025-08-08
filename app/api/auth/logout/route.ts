import { NextRequest, NextResponse } from 'next/server'
import { invalidateSession } from '@/lib/utils/auth'
import { getSessionIdFromRequest, clearSessionCookie } from '@/lib/utils/session'

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionIdFromRequest(request)

    if (sessionId) {
      // Invalidate the session in the database
      await invalidateSession(sessionId)
    }

    // Create response and clear session cookie
    const response = NextResponse.json({ success: true })
    clearSessionCookie(response)

    return response

  } catch (error) {
    console.error('Logout API error:', error)
    
    // Even if there's an error, clear the cookie
    const response = NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
    clearSessionCookie(response)
    
    return response
  }
}
