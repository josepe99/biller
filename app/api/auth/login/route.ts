import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/utils/auth'
import { setSessionCookie } from '@/lib/utils/session'
import type { LoginRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get user agent and IP for security tracking
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     undefined

    // Attempt login
    const result = await loginUser(
      { email, password },
      userAgent,
      ipAddress
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: result.user
    })

    // Set session cookie
    if (result.session) {
      setSessionCookie(response, result.session.id)
    }

    return response

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
