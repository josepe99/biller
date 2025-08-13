import { PermissionController } from '@/lib/controllers/permission.controller'
import { SessionController } from './session.controller'
import { CustomError } from '../error/custom-error'

export class AuthController {
  private sessionController: SessionController
  private permissionController: PermissionController

  constructor() {
    this.sessionController = new SessionController()
    this.permissionController = new PermissionController()
  }

  /**
   * Obtiene los nombres de los permisos del usuario a partir de la sessionId
   */
  async getPermissionsBySessionId(sessionId: string): Promise<string[]> {
    if (!sessionId) return []

    const session = await this.sessionController.validateSession(sessionId)
    if (!session || !session.userId) throw new CustomError("Session not found or expired", "SESSION_EXPIRED")

    return await this.permissionController.getPermissionsByUserId(session.userId)
  }
}
