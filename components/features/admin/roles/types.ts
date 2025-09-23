export interface PermissionOption {
  id: string;
  name: string;
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description?: string | null;
  permissions?: PermissionOption[];
}
