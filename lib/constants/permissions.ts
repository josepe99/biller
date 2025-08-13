// All permissions needed for a comprehensive POS system
export const permissions = [
  // User Management Permissions
  {
    name: 'users:create',
    description: 'Create new users',
    resource: 'users',
    action: 'create',
    category: 'User Management'
  },
  {
    name: 'users:read',
    description: 'View users and user details',
    resource: 'users',
    action: 'read',
    category: 'User Management'
  },
  {
    name: 'users:update',
    description: 'Update user information and profiles',
    resource: 'users',
    action: 'update',
    category: 'User Management'
  },
  {
    name: 'users:delete',
    description: 'Delete or deactivate users',
    resource: 'users',
    action: 'delete',
    category: 'User Management'
  },
  {
    name: 'users:manage',
    description: 'Full user management access',
    resource: 'users',
    action: 'manage',
    category: 'User Management'
  },

  // Product Management Permissions
  {
    name: 'products:create',
    description: 'Add new products to inventory',
    resource: 'products',
    action: 'create',
    category: 'Product Management'
  },
  {
    name: 'products:read',
    description: 'View products and product details',
    resource: 'products',
    action: 'read',
    category: 'Product Management'
  },
  {
    name: 'products:update',
    description: 'Update product information, prices, and details',
    resource: 'products',
    action: 'update',
    category: 'Product Management'
  },
  {
    name: 'products:delete',
    description: 'Delete or deactivate products',
    resource: 'products',
    action: 'delete',
    category: 'Product Management'
  },
  {
    name: 'products:manage',
    description: 'Full product management access',
    resource: 'products',
    action: 'manage',
    category: 'Product Management'
  },

  // Category Management Permissions
  {
    name: 'categories:create',
    description: 'Create new product categories',
    resource: 'categories',
    action: 'create',
    category: 'Category Management'
  },
  {
    name: 'categories:read',
    description: 'View categories and category details',
    resource: 'categories',
    action: 'read',
    category: 'Category Management'
  },
  {
    name: 'categories:update',
    description: 'Update category information',
    resource: 'categories',
    action: 'update',
    category: 'Category Management'
  },
  {
    name: 'categories:delete',
    description: 'Delete or deactivate categories',
    resource: 'categories',
    action: 'delete',
    category: 'Category Management'
  },
  {
    name: 'categories:manage',
    description: 'Full category management access',
    resource: 'categories',
    action: 'manage',
    category: 'Category Management'
  },

  // Sales Management Permissions
  {
    name: 'sales:create',
    description: 'Process new sales and transactions',
    resource: 'sales',
    action: 'create',
    category: 'Sales Management'
  },
  {
    name: 'sales:read',
    description: 'View sales history and transaction details',
    resource: 'sales',
    action: 'read',
    category: 'Sales Management'
  },
  {
    name: 'sales:update',
    description: 'Modify existing sales (limited scenarios)',
    resource: 'sales',
    action: 'update',
    category: 'Sales Management'
  },
  {
    name: 'sales:delete',
    description: 'Cancel or void sales transactions',
    resource: 'sales',
    action: 'delete',
    category: 'Sales Management'
  },
  {
    name: 'sales:refund',
    description: 'Process refunds and returns',
    resource: 'sales',
    action: 'refund',
    category: 'Sales Management'
  },
  {
    name: 'sales:discount',
    description: 'Apply discounts to sales',
    resource: 'sales',
    action: 'discount',
    category: 'Sales Management'
  },
  {
    name: 'sales:manage',
    description: 'Full sales management access',
    resource: 'sales',
    action: 'manage',
    category: 'Sales Management'
  },

  // Inventory Management Permissions
  {
    name: 'inventory:read',
    description: 'View inventory levels and stock information',
    resource: 'inventory',
    action: 'read',
    category: 'Inventory Management'
  },
  {
    name: 'inventory:update',
    description: 'Adjust inventory levels and stock counts',
    resource: 'inventory',
    action: 'update',
    category: 'Inventory Management'
  },
  {
    name: 'inventory:restock',
    description: 'Add new stock and manage restocking',
    resource: 'inventory',
    action: 'restock',
    category: 'Inventory Management'
  },
  {
    name: 'inventory:adjustment',
    description: 'Make inventory adjustments and corrections',
    resource: 'inventory',
    action: 'adjustment',
    category: 'Inventory Management'
  },
  {
    name: 'inventory:manage',
    description: 'Full inventory management access',
    resource: 'inventory',
    action: 'manage',
    category: 'Inventory Management'
  },

  // Customer Management Permissions
  {
    name: 'customers:create',
    description: 'Add new customers to the system',
    resource: 'customers',
    action: 'create',
    category: 'Customer Management'
  },
  {
    name: 'customers:read',
    description: 'View customer information and history',
    resource: 'customers',
    action: 'read',
    category: 'Customer Management'
  },
  {
    name: 'customers:update',
    description: 'Update customer information',
    resource: 'customers',
    action: 'update',
    category: 'Customer Management'
  },
  {
    name: 'customers:delete',
    description: 'Delete or deactivate customers',
    resource: 'customers',
    action: 'delete',
    category: 'Customer Management'
  },
  {
    name: 'customers:manage',
    description: 'Full customer management access',
    resource: 'customers',
    action: 'manage',
    category: 'Customer Management'
  },

  // Payment Management Permissions
  {
    name: 'payments:process',
    description: 'Process payments and handle payment methods',
    resource: 'payments',
    action: 'process',
    category: 'Payment Management'
  },
  {
    name: 'payments:read',
    description: 'View payment history and details',
    resource: 'payments',
    action: 'read',
    category: 'Payment Management'
  },
  {
    name: 'payments:refund',
    description: 'Process payment refunds',
    resource: 'payments',
    action: 'refund',
    category: 'Payment Management'
  },
  {
    name: 'payments:methods',
    description: 'Manage payment methods configuration',
    resource: 'payments',
    action: 'methods',
    category: 'Payment Management'
  },
  {
    name: 'payments:manage',
    description: 'Full payment management access',
    resource: 'payments',
    action: 'manage',
    category: 'Payment Management'
  },

  // Reports and Analytics Permissions
  {
    name: 'reports:sales',
    description: 'View sales reports and analytics',
    resource: 'reports',
    action: 'sales',
    category: 'Reports & Analytics'
  },
  {
    name: 'reports:inventory',
    description: 'View inventory reports and stock analytics',
    resource: 'reports',
    action: 'inventory',
    category: 'Reports & Analytics'
  },
  {
    name: 'reports:financial',
    description: 'View financial reports and revenue analytics',
    resource: 'reports',
    action: 'financial',
    category: 'Reports & Analytics'
  },
  {
    name: 'reports:customers',
    description: 'View customer reports and analytics',
    resource: 'reports',
    action: 'customers',
    category: 'Reports & Analytics'
  },
  {
    name: 'reports:export',
    description: 'Export reports in various formats',
    resource: 'reports',
    action: 'export',
    category: 'Reports & Analytics'
  },
  {
    name: 'reports:manage',
    description: 'Full reports and analytics access',
    resource: 'reports',
    action: 'manage',
    category: 'Reports & Analytics'
  },

  // Cash Management Permissions
  {
    name: 'cash:register_open',
    description: 'Open cash register and start shift',
    resource: 'cash',
    action: 'register_open',
    category: 'Cash Management'
  },
  {
    name: 'cash:register_close',
    description: 'Close cash register and end shift',
    resource: 'cash',
    action: 'register_close',
    category: 'Cash Management'
  },
  {
    name: 'cash:drawer_open',
    description: 'Open cash drawer manually',
    resource: 'cash',
    action: 'drawer_open',
    category: 'Cash Management'
  },
  {
    name: 'cash:count',
    description: 'Perform cash counts and reconciliation',
    resource: 'cash',
    action: 'count',
    category: 'Cash Management'
  },
  {
    name: 'cash:manage',
    description: 'Full cash management access',
    resource: 'cash',
    action: 'manage',
    category: 'Cash Management'
  },

  // System Settings Permissions
  {
    name: 'settings:general',
    description: 'Modify general system settings',
    resource: 'settings',
    action: 'general',
    category: 'System Settings'
  },
  {
    name: 'settings:pos',
    description: 'Configure POS-specific settings',
    resource: 'settings',
    action: 'pos',
    category: 'System Settings'
  },
  {
    name: 'settings:tax',
    description: 'Configure tax rates and settings',
    resource: 'settings',
    action: 'tax',
    category: 'System Settings'
  },
  {
    name: 'settings:receipts',
    description: 'Configure receipt templates and printing',
    resource: 'settings',
    action: 'receipts',
    category: 'System Settings'
  },
  {
    name: 'settings:backup',
    description: 'Manage system backups and data export',
    resource: 'settings',
    action: 'backup',
    category: 'System Settings'
  },
  {
    name: 'settings:manage',
    description: 'Full system settings access',
    resource: 'settings',
    action: 'manage',
    category: 'System Settings'
  },

  // Role and Permission Management
  {
    name: 'roles:create',
    description: 'Create new user roles',
    resource: 'roles',
    action: 'create',
    category: 'Role Management'
  },
  {
    name: 'roles:read',
    description: 'View roles and role details',
    resource: 'roles',
    action: 'read',
    category: 'Role Management'
  },
  {
    name: 'roles:update',
    description: 'Update role information and permissions',
    resource: 'roles',
    action: 'update',
    category: 'Role Management'
  },
  {
    name: 'roles:delete',
    description: 'Delete or deactivate roles',
    resource: 'roles',
    action: 'delete',
    category: 'Role Management'
  },
  {
    name: 'roles:assign',
    description: 'Assign roles to users',
    resource: 'roles',
    action: 'assign',
    category: 'Role Management'
  },
  {
    name: 'roles:manage',
    description: 'Full role management access',
    resource: 'roles',
    action: 'manage',
    category: 'Role Management'
  },

  {
    name: 'permissions:read',
    description: 'View available permissions',
    resource: 'permissions',
    action: 'read',
    category: 'Permission Management'
  },
  {
    name: 'permissions:assign',
    description: 'Assign permissions to roles',
    resource: 'permissions',
    action: 'assign',
    category: 'Permission Management'
  },
  {
    name: 'permissions:manage',
    description: 'Full permission management access',
    resource: 'permissions',
    action: 'manage',
    category: 'Permission Management'
  },

  // Barcode and Scanner Permissions
  {
    name: 'barcode:scan',
    description: 'Use barcode scanner functionality',
    resource: 'barcode',
    action: 'scan',
    category: 'Barcode Management'
  },
  {
    name: 'barcode:generate',
    description: 'Generate barcodes for products',
    resource: 'barcode',
    action: 'generate',
    category: 'Barcode Management'
  },
  {
    name: 'barcode:manage',
    description: 'Full barcode management access',
    resource: 'barcode',
    action: 'manage',
    category: 'Barcode Management'
  },

  // Promotions and Discounts
  {
    name: 'promotions:create',
    description: 'Create new promotions and discount campaigns',
    resource: 'promotions',
    action: 'create',
    category: 'Promotions & Discounts'
  },
  {
    name: 'promotions:read',
    description: 'View promotions and discount details',
    resource: 'promotions',
    action: 'read',
    category: 'Promotions & Discounts'
  },
  {
    name: 'promotions:update',
    description: 'Update promotion and discount information',
    resource: 'promotions',
    action: 'update',
    category: 'Promotions & Discounts'
  },
  {
    name: 'promotions:delete',
    description: 'Delete or deactivate promotions',
    resource: 'promotions',
    action: 'delete',
    category: 'Promotions & Discounts'
  },
  {
    name: 'promotions:apply',
    description: 'Apply promotions and discounts to sales',
    resource: 'promotions',
    action: 'apply',
    category: 'Promotions & Discounts'
  },
  {
    name: 'promotions:manage',
    description: 'Full promotions and discounts access',
    resource: 'promotions',
    action: 'manage',
    category: 'Promotions & Discounts'
  },

  // Supplier Management
  {
    name: 'suppliers:create',
    description: 'Add new suppliers',
    resource: 'suppliers',
    action: 'create',
    category: 'Supplier Management'
  },
  {
    name: 'suppliers:read',
    description: 'View supplier information',
    resource: 'suppliers',
    action: 'read',
    category: 'Supplier Management'
  },
  {
    name: 'suppliers:update',
    description: 'Update supplier information',
    resource: 'suppliers',
    action: 'update',
    category: 'Supplier Management'
  },
  {
    name: 'suppliers:delete',
    description: 'Delete or deactivate suppliers',
    resource: 'suppliers',
    action: 'delete',
    category: 'Supplier Management'
  },
  {
    name: 'suppliers:manage',
    description: 'Full supplier management access',
    resource: 'suppliers',
    action: 'manage',
    category: 'Supplier Management'
  },

  // Audit and Logs
  {
    name: 'audit:read',
    description: 'View system audit logs and activity history',
    resource: 'audit',
    action: 'read',
    category: 'Audit & Logs'
  },
  {
    name: 'audit:export',
    description: 'Export audit logs and reports',
    resource: 'audit',
    action: 'export',
    category: 'Audit & Logs'
  },
  {
    name: 'audit:manage',
    description: 'Full audit and logging access',
    resource: 'audit',
    action: 'manage',
    category: 'Audit & Logs'
  },

  // Notifications and Alerts
  {
    name: 'notifications:read',
    description: 'View system notifications and alerts',
    resource: 'notifications',
    action: 'read',
    category: 'Notifications'
  },
  {
    name: 'notifications:create',
    description: 'Create and send notifications',
    resource: 'notifications',
    action: 'create',
    category: 'Notifications'
  },
  {
    name: 'notifications:manage',
    description: 'Full notification management access',
    resource: 'notifications',
    action: 'manage',
    category: 'Notifications'
  },

  // System Administration
  {
    name: 'system:maintenance',
    description: 'Perform system maintenance tasks',
    resource: 'system',
    action: 'maintenance',
    category: 'System Administration'
  },
  {
    name: 'system:database',
    description: 'Access database administration features',
    resource: 'system',
    action: 'database',
    category: 'System Administration'
  },
  {
    name: 'system:logs',
    description: 'Access system logs and debugging information',
    resource: 'system',
    action: 'logs',
    category: 'System Administration'
  },
  {
    name: 'system:manage',
    description: 'Full system administration access',
    resource: 'system',
    action: 'manage',
    category: 'System Administration'
  }
] as const

// Helper function to get permissions by category
export const getPermissionsByCategory = (category: string) => {
  return permissions.filter(permission => permission.category === category)
}

// Helper function to get permissions by resource
export const getPermissionsByResource = (resource: string) => {
  return permissions.filter(permission => permission.resource === resource)
}

// Helper function to get all unique categories
export const getCategories = () => {
  return [...new Set(permissions.map(permission => permission.category))]
}

// Helper function to get all unique resources
export const getResources = () => {
  return [...new Set(permissions.map(permission => permission.resource))]
}

// Helper function to get all unique actions
export const getActions = () => {
  return [...new Set(permissions.map(permission => permission.action))]
}

// Type definitions for better TypeScript support
export type PermissionName = typeof permissions[number]['name']
export type PermissionResource = typeof permissions[number]['resource']
export type PermissionAction = typeof permissions[number]['action']
export type PermissionCategory = typeof permissions[number]['category']

export interface Permission {
  name: string
  description: string
  resource: string
  action: string
  category: string
}