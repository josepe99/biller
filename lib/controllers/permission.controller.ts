import { PermissionDatasource } from '@/lib/datasources/permission.datasource'

export class PermissionController {
  private permissionDatasource: PermissionDatasource

  constructor() {
    this.permissionDatasource = new PermissionDatasource()
  }

  /**
   * Obtiene los nombres de los permisos de un usuario
   */
  async getPermissionsByUserId(userId: string): Promise<string[]> {
    return await this.permissionDatasource.getPermissionsByUserId(userId)
  }

  /**
   * Obtiene todos los permisos disponibles (id y name)
   */
  async getAllPermissions(): Promise<{ id: string; name: string }[]> {
    return await this.permissionDatasource.getAllPermissions();
  }
}
