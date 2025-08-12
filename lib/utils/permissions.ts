import { prisma } from '../prisma'
import type { AuthUser } from '../types'

// Define permission actions
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage' // Full access
}

// Define resources
export enum PermissionResource {
  USERS = 'users',
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  SALES = 'sales',
  INVENTORY = 'inventory',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  ROLES = 'roles',
  PERMISSIONS = 'permissions'
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  resource: PermissionResource,
  action: PermissionAction
): Promise<boolean> {
  try {
    // Get user's roles with permissions
    const userRoles = await prisma.userRoleAssignment.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              where: {
                deletedAt: null
              },
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    // Check if user has the required permission through any of their roles
    for (const userRole of userRoles) {
      if (userRole.role.deletedAt) continue

      for (const rolePermission of userRole.role.rolePermissions) {
        const permission = rolePermission.permission
        
        if (permission.deletedAt) continue

        // Check for exact match or manage permission (which grants all actions)
        if (permission.resource === resource && 
            (permission.action === action || permission.action === PermissionAction.MANAGE)) {
          return true
        }
      }
    }

    return false
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissions: Array<{ resource: PermissionResource; action: PermissionAction }>
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission.resource, permission.action)) {
      return true
    }
  }
  return false
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<Array<{ resource: string; action: string }>> {
  try {
    const userRoles = await prisma.userRoleAssignment.findMany({
      where: {
        userId,
        deletedAt: null
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              where: {
                deletedAt: null
              },
              include: {
                permission: true
              }
            }
          }
        }
      }
    })
    console.log('userRoles: ', userRoles)

    const permissions: Array<{ resource: string; action: string }> = []

    for (const userRole of userRoles) {
      if (userRole.role.deletedAt) continue

      for (const rolePermission of userRole.role.rolePermissions) {
        const permission = rolePermission.permission
        
        if (permission.deletedAt) continue

        permissions.push({
          resource: permission.resource,
          action: permission.action
        })
      }
    }

    return permissions
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(
  userId: string,
  roleId: string,
  assignedBy?: string
): Promise<boolean> {
  try {
    // Check if assignment already exists
    const existing = await prisma.userRoleAssignment.findFirst({
      where: {
        userId,
        roleId,
        deletedAt: null
      }
    })

    if (existing) {
      return true
    }

    // Create new assignment
    await prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId,
        assignedBy
      }
    })

    return true
  } catch (error) {
    console.error('Error assigning role:', error)
    return false
  }
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
  try {
    await prisma.userRoleAssignment.updateMany({
      where: {
        userId,
        roleId
      },
      data: {
        deletedAt: new Date()
      }
    })

    return true
  } catch (error) {
    console.error('Error removing role:', error)
    return false
  }
}

/**
 * Assign permission to role
 */
export async function assignPermissionToRole(
  roleId: string,
  permissionId: string,
  grantedBy?: string
): Promise<boolean> {
  try {
    // Check if assignment already exists
    const existing = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId,
        deletedAt: null
      }
    })

    if (existing) {
      return true
    }

    // Create new assignment
    await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
        grantedBy
      }
    })

    return true
  } catch (error) {
    console.error('Error assigning permission:', error)
    return false
  }
}

/**
 * Remove permission from role
 */
export async function removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
  try {
    await prisma.rolePermission.updateMany({
      where: {
        roleId,
        permissionId
      },
      data: {
        deletedAt: new Date()
      }
    })

    return true
  } catch (error) {
    console.error('Error removing permission:', error)
    return false
  }
}

/**
 * Create default permissions
 */
export async function createDefaultPermissions(): Promise<void> {
  const defaultPermissions = [
    // User management
    { resource: PermissionResource.USERS, action: PermissionAction.CREATE, description: 'Create new users' },
    { resource: PermissionResource.USERS, action: PermissionAction.READ, description: 'View users' },
    { resource: PermissionResource.USERS, action: PermissionAction.UPDATE, description: 'Update user information' },
    { resource: PermissionResource.USERS, action: PermissionAction.DELETE, description: 'Delete users' },
    { resource: PermissionResource.USERS, action: PermissionAction.MANAGE, description: 'Full user management access' },

    // Product management
    { resource: PermissionResource.PRODUCTS, action: PermissionAction.CREATE, description: 'Create new products' },
    { resource: PermissionResource.PRODUCTS, action: PermissionAction.READ, description: 'View products' },
    { resource: PermissionResource.PRODUCTS, action: PermissionAction.UPDATE, description: 'Update product information' },
    { resource: PermissionResource.PRODUCTS, action: PermissionAction.DELETE, description: 'Delete products' },
    { resource: PermissionResource.PRODUCTS, action: PermissionAction.MANAGE, description: 'Full product management access' },

    // Category management
    { resource: PermissionResource.CATEGORIES, action: PermissionAction.CREATE, description: 'Create new categories' },
    { resource: PermissionResource.CATEGORIES, action: PermissionAction.READ, description: 'View categories' },
    { resource: PermissionResource.CATEGORIES, action: PermissionAction.UPDATE, description: 'Update category information' },
    { resource: PermissionResource.CATEGORIES, action: PermissionAction.DELETE, description: 'Delete categories' },
    { resource: PermissionResource.CATEGORIES, action: PermissionAction.MANAGE, description: 'Full category management access' },

    // Sales management
    { resource: PermissionResource.SALES, action: PermissionAction.CREATE, description: 'Create new sales' },
    { resource: PermissionResource.SALES, action: PermissionAction.READ, description: 'View sales' },
    { resource: PermissionResource.SALES, action: PermissionAction.UPDATE, description: 'Update sales information' },
    { resource: PermissionResource.SALES, action: PermissionAction.DELETE, description: 'Delete sales' },
    { resource: PermissionResource.SALES, action: PermissionAction.MANAGE, description: 'Full sales management access' },

    // Inventory management
    { resource: PermissionResource.INVENTORY, action: PermissionAction.READ, description: 'View inventory' },
    { resource: PermissionResource.INVENTORY, action: PermissionAction.UPDATE, description: 'Update inventory levels' },
    { resource: PermissionResource.INVENTORY, action: PermissionAction.MANAGE, description: 'Full inventory management access' },

    // Reports
    { resource: PermissionResource.REPORTS, action: PermissionAction.READ, description: 'View reports' },
    { resource: PermissionResource.REPORTS, action: PermissionAction.MANAGE, description: 'Full reports access' },

    // Settings
    { resource: PermissionResource.SETTINGS, action: PermissionAction.READ, description: 'View settings' },
    { resource: PermissionResource.SETTINGS, action: PermissionAction.UPDATE, description: 'Update settings' },
    { resource: PermissionResource.SETTINGS, action: PermissionAction.MANAGE, description: 'Full settings access' },

    // Roles and permissions
    { resource: PermissionResource.ROLES, action: PermissionAction.CREATE, description: 'Create new roles' },
    { resource: PermissionResource.ROLES, action: PermissionAction.READ, description: 'View roles' },
    { resource: PermissionResource.ROLES, action: PermissionAction.UPDATE, description: 'Update roles' },
    { resource: PermissionResource.ROLES, action: PermissionAction.DELETE, description: 'Delete roles' },
    { resource: PermissionResource.ROLES, action: PermissionAction.MANAGE, description: 'Full role management access' },

    { resource: PermissionResource.PERMISSIONS, action: PermissionAction.CREATE, description: 'Create new permissions' },
    { resource: PermissionResource.PERMISSIONS, action: PermissionAction.READ, description: 'View permissions' },
    { resource: PermissionResource.PERMISSIONS, action: PermissionAction.UPDATE, description: 'Update permissions' },
    { resource: PermissionResource.PERMISSIONS, action: PermissionAction.DELETE, description: 'Delete permissions' },
    { resource: PermissionResource.PERMISSIONS, action: PermissionAction.MANAGE, description: 'Full permission management access' },
  ]

  for (const permission of defaultPermissions) {
    await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action
        }
      },
      create: {
        name: `${permission.resource}:${permission.action}`,
        description: permission.description,
        resource: permission.resource,
        action: permission.action
      },
      update: {}
    })
  }
}

/**
 * Create default roles with permissions
 */
export async function createDefaultRoles(): Promise<void> {
  // Create permissions first
  await createDefaultPermissions()

  // Admin role - full access
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrator' },
    create: {
      name: 'Administrator',
      description: 'Full system access'
    },
    update: {}
  })

  // Manager role - limited admin access
  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    create: {
      name: 'Manager',
      description: 'Management access with some restrictions'
    },
    update: {}
  })

  // Cashier role - basic operations
  const cashierRole = await prisma.role.upsert({
    where: { name: 'Cashier' },
    create: {
      name: 'Cashier',
      description: 'Basic POS operations'
    },
    update: {}
  })

  // Get all permissions
  const allPermissions = await prisma.permission.findMany()

  // Assign permissions to Admin (all permissions)
  for (const permission of allPermissions) {
    await assignPermissionToRole(adminRole.id, permission.id)
  }

  // Assign permissions to Manager
  const managerPermissions = allPermissions.filter(p => {
    // Exclude: USERS:DELETE, all ROLES, all PERMISSIONS
    if (p.resource === PermissionResource.USERS && p.action === PermissionAction.DELETE) return false;
    if (p.resource === PermissionResource.ROLES) return false;
    if (p.resource === PermissionResource.PERMISSIONS) return false;
    return true;
  })
  
  for (const permission of managerPermissions) {
    await assignPermissionToRole(managerRole.id, permission.id)
  }

  // Assign permissions to Cashier
  const cashierPermissions = allPermissions.filter(p => 
    (p.resource === PermissionResource.PRODUCTS && p.action === PermissionAction.READ) ||
    (p.resource === PermissionResource.CATEGORIES && p.action === PermissionAction.READ) ||
    (p.resource === PermissionResource.SALES && (p.action === PermissionAction.CREATE || p.action === PermissionAction.READ)) ||
    (p.resource === PermissionResource.INVENTORY && p.action === PermissionAction.READ)
  )
  
  for (const permission of cashierPermissions) {
    await assignPermissionToRole(cashierRole.id, permission.id)
  }
}
