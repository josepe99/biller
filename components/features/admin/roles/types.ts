export interface PermissionOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description?: string | null;
  permissions?: PermissionOption[];
}
