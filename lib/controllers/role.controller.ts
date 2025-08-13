// Role Controller - CRUD (except delete), with permissions management
import { RoleDatasource } from '@/lib/datasources/role.datasource';
import { PermissionDatasource } from '../datasources/permission.datasource';

export class RoleController {
  private roleDatasource: RoleDatasource;
  private permissionDatasource: PermissionDatasource;

  constructor() {
    this.roleDatasource = new RoleDatasource();
    this.permissionDatasource = new PermissionDatasource();
  }

  // Get all roles, optionally with permissions
  async getAll(withPermissions: boolean = false) {
    if (!withPermissions) return this.roleDatasource.getAll();
    // Get roles and their permissions
    const roles = await this.roleDatasource.getAll();
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role: any) => {
        const permissions = await this.roleDatasource.getPermissions(role.id);
        return { ...role, permissions };
      })
    );
    return rolesWithPermissions;
  }

  // Get a single role by id, with permissions
  async getById(id: string) {
    const role = await this.roleDatasource.getById(id);
    if (!role) return null;
    const permissions = await this.roleDatasource.getPermissions(id);
    return { ...role, permissions };
  }

  // Create a new role, with optional permissions
  async create(data: { name: string; description?: string; permissionsToAdd?: string[] }) {
    const role = await this.roleDatasource.create({ name: data.name, description: data.description });
    if (data.permissionsToAdd && data.permissionsToAdd.length > 0) {
      await this.roleDatasource.setPermissions(role.id, data.permissionsToAdd, []);
    }
    return this.getById(role.id);
  }

  // Update a role, including permissions
  async update(id: string, data: { name?: string; description?: string; permissionsToAdd?: string[]; permissionsToRemove?: string[] }) {
    // Remove permissionsToAdd/permissionsToRemove before updating the role
    const { permissionsToAdd, permissionsToRemove, ...roleData } = data;
    await this.roleDatasource.update(id, roleData);
    if ((permissionsToAdd && permissionsToAdd.length > 0) || (permissionsToRemove && permissionsToRemove.length > 0)) {
      await this.roleDatasource.setPermissions(id, permissionsToAdd || [], permissionsToRemove || []);
    }
    return this.getById(id);
  }

  // No delete method (roles cannot be deleted)
}
