import { SessionController } from '@/lib/controllers/session.controller'
import { UserController } from '@/lib/controllers/user.controller'
import type { AuthUser } from '@/lib/types'

export async function validateSessionAction(sessionId: string): Promise<{ success: boolean; user?: AuthUser; sessionExtended?: boolean; error?: string }> {
  try {
    if (!sessionId) {
      return { success: false, error: 'Session ID is required' }
    }

    const sessionController = new SessionController()
    const session = await sessionController.getById(sessionId)

    if (!session || !session.userId) {
      return { success: false, error: 'Session not found or expired' }
    }

    const userController = new UserController()
    const userResult = await userController.getById(session.userId)
    if (!userResult.success || !userResult.data) {
      return { success: false, error: 'User not found' }
    }

    // Map user to AuthUser type
    const user = userResult.data as any
    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    return { success: true, user: authUser }
  } catch (error) {
    console.error('Error validating session:', error)
    return { success: false, error: 'Internal server error' }
  }
}
