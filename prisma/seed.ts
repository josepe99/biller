import { permissions } from '../lib/constants/permissions'
import { hashPassword } from '../lib/utils/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Step 1: Create all permissions
  console.log('📋 Creating permissions...')
  const createdPermissions = new Map()

  for (const permission of permissions) {
    const createdPermission = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action
        }
      },
      update: {
        name: permission.name,
        description: permission.description,
        deletedAt: null,
      },
      create: {
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
        deletedAt: null,
      },
    })
    createdPermissions.set(permission.name, createdPermission.id)
  }

  console.log(`✅ Created ${permissions.length} permissions`)

  // Step 2: Create roles with their permissions
  console.log('👥 Creating roles...')

  // Admin Role - Full access to everything
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {
      description: 'Full system administrator with complete access',
      deletedAt: null,
    },
    create: {
      name: 'Admin',
      description: 'Full system administrator with complete access',
      deletedAt: null,
    },
  })

  // Manager Role - Most permissions except critical system management
  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {
      description: 'Store manager with access to daily operations and reports',
      deletedAt: null,
    },
    create: {
      name: 'Manager',
      description: 'Store manager with access to daily operations and reports',
      deletedAt: null,
    },
  })

  // Cashier Role - Limited to sales operations
  const cashierRole = await prisma.role.upsert({
    where: { name: 'Cashier' },
    update: {
      description: 'Point of sale operator with limited access',
      deletedAt: null,
    },
    create: {
      name: 'Cashier',
      description: 'Point of sale operator with limited access',
      deletedAt: null,
    },
  })

  console.log('✅ Created roles: Admin, Manager, Cashier')

  // Step 3: Assign permissions to roles
  console.log('🔗 Assigning permissions to roles...')

  // Admin gets ALL permissions
  const adminPermissions = permissions.map(p => p.name)

  // Manager gets most permissions except critical system administration
  const managerPermissions = permissions
    .filter(p =>
      !p.name.includes('system:') ||
      p.name === 'system:logs' // Managers can view logs but not manage system
    )
    .filter(p =>
      !p.name.includes('users:delete') &&
      !p.name.includes('users:manage') &&
      !p.name.includes('roles:delete') &&
      !p.name.includes('roles:manage') &&
      !p.name.includes('permissions:manage')
    )
    .map(p => p.name)

  // Cashier gets basic sales and inventory read permissions
  const cashierPermissions = permissions
    .filter(p =>
      // Sales operations
      p.resource === 'sales' && ['create', 'read'].includes(p.action) ||
      // Product viewing only
      p.resource === 'products' && p.action === 'read' ||
      // Category viewing only
      p.resource === 'categories' && p.action === 'read' ||
      // Basic inventory reading
      p.resource === 'inventory' && p.action === 'read' ||
      // Customer basic operations
      p.resource === 'customers' && ['create', 'read', 'update'].includes(p.action) ||
      // Payment processing
      p.resource === 'payments' && ['process', 'read'].includes(p.action) ||
      // Cash register operations
      p.resource === 'cash' && ['register_open', 'register_close', 'drawer_open', 'count'].includes(p.action) ||
      // Barcode scanning
      p.resource === 'barcode' && p.action === 'scan' ||
      // Basic promotions
      p.resource === 'promotions' && ['read', 'apply'].includes(p.action)
    )
    .map(p => p.name)

  // Assign permissions to Admin role
  for (const permissionName of adminPermissions) {
    const permissionId = createdPermissions.get(permissionName)
    if (permissionId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permissionId
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permissionId,
          deletedAt: null,
        }
      })
    }
  }

  // Assign permissions to Manager role
  for (const permissionName of managerPermissions) {
    const permissionId = createdPermissions.get(permissionName)
    if (permissionId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permissionId
          }
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: permissionId,
          deletedAt: null,
        }
      })
    }
  }

  // Assign permissions to Cashier role
  for (const permissionName of cashierPermissions) {
    const permissionId = createdPermissions.get(permissionName)
    if (permissionId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: cashierRole.id,
            permissionId: permissionId
          }
        },
        update: {},
        create: {
          roleId: cashierRole.id,
          permissionId: permissionId,
          deletedAt: null,
        }
      })
    }
  }

  console.log(`✅ Assigned ${adminPermissions.length} permissions to Admin`)
  console.log(`✅ Assigned ${managerPermissions.length} permissions to Manager`)
  console.log(`✅ Assigned ${cashierPermissions.length} permissions to Cashier`)

  // Step 4: Create users with proper role assignments
  console.log('👤 Creating users...')

  // Create Admin User
  const adminPassword = await hashPassword('admin123')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {
      name: 'System',
      lastname: 'Administrator',
      password: adminPassword,
      role: 'ADMIN',
      deletedAt: null
    },
    create: {
      email: 'admin@pos.com',
      name: 'System',
      lastname: 'Administrator',
      password: adminPassword,
      role: 'ADMIN',
      deletedAt: null,
    },
  })

  // Assign Admin role to admin user
  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
      deletedAt: null,
    }
  })

  // Create Manager User
  const managerPassword = await hashPassword('manager123')
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@pos.com' },
    update: {
      name: 'Store',
      lastname: 'Manager',
      password: managerPassword,
      role: 'MANAGER',
      deletedAt: null
    },
    create: {
      email: 'manager@pos.com',
      name: 'Store',
      lastname: 'Manager',
      password: managerPassword,
      role: 'MANAGER',
      deletedAt: null,
    },
  })

  // Assign Manager role to manager user
  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: managerUser.id,
        roleId: managerRole.id
      }
    },
    update: {},
    create: {
      userId: managerUser.id,
      roleId: managerRole.id,
      deletedAt: null,
    }
  })

  // Create Cashier User
  const cashierPassword = await hashPassword('cashier123')
  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@pos.com' },
    update: {
      name: 'Store',
      lastname: 'Cashier',
      password: cashierPassword,
      role: 'CASHIER',
      deletedAt: null
    },
    create: {
      email: 'cashier@pos.com',
      name: 'Store',
      lastname: 'Cashier',
      password: cashierPassword,
      role: 'CASHIER',
      deletedAt: null,
    },
  })

  // Assign Cashier role to cashier user
  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: cashierUser.id,
        roleId: cashierRole.id
      }
    },
    update: {},
    create: {
      userId: cashierUser.id,
      roleId: cashierRole.id,
      deletedAt: null,
    }
  })

  // Step 6: Create checkout points (cash registers)
  console.log('💰 Creating checkout points...')

  const checkouts = [
    {
      name: 'Caja 1',
      description: 'Caja principal - Entrada principal',
      deletedAt: null,
      invoicePrefix: '001',
      invoiceMiddle: '001',
      invoiceSequence: 0
    },
    {
      name: 'Caja 2',
      description: 'Caja secundaria - Sector A',
      deletedAt: null,
      invoicePrefix: '001',
      invoiceMiddle: '002',
      invoiceSequence: 0
    },
    {
      name: 'Caja 3',
      description: 'Caja express - Compras rápidas',
      deletedAt: null,
      invoicePrefix: '001',
      invoiceMiddle: '003',
      invoiceSequence: 0
    },
    {
      name: 'Caja 4',
      description: 'Caja primer piso',
      deletedAt: null,
      invoicePrefix: '001',
      invoiceMiddle: '004',
      invoiceSequence: 0
    },
    {
      name: 'Caja 5',
      description: 'Caja autoservicio',
      deletedAt: null,
      invoicePrefix: '001',
      invoiceMiddle: '005',
      invoiceSequence: 0
    },
  ]

  for (const checkout of checkouts) {
    await prisma.checkout.upsert({
      where: { name: checkout.name },
      update: {},
      create: checkout,
    })
  }

  console.log('✅ Created 5 checkout points (Caja 1-5)')

  console.log('✅ Database seeded successfully!')
  console.log('📝 Default users created:')
  console.log('   - Admin: admin@pos.com / admin123')
  console.log('   - Manager: manager@pos.com / manager123')
  console.log('   - Cashier: cashier@pos.com / cashier123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
