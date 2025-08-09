import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/utils/auth'
import { permissions } from '../lib/constants/permissions'

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
        isActive: true
      },
      create: {
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
        isActive: true
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
      isActive: true
    },
    create: {
      name: 'Admin',
      description: 'Full system administrator with complete access',
      isActive: true
    },
  })

  // Manager Role - Most permissions except critical system management
  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {
      description: 'Store manager with access to daily operations and reports',
      isActive: true
    },
    create: {
      name: 'Manager',
      description: 'Store manager with access to daily operations and reports',
      isActive: true
    },
  })

  // Cashier Role - Limited to sales operations
  const cashierRole = await prisma.role.upsert({
    where: { name: 'Cashier' },
    update: {
      description: 'Point of sale operator with limited access',
      isActive: true
    },
    create: {
      name: 'Cashier',
      description: 'Point of sale operator with limited access',
      isActive: true
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
      p.resource === 'cash' &&  ['register_open', 'register_close', 'drawer_open', 'count'].includes(p.action) ||
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
        update: { isActive: true },
        create: {
          roleId: adminRole.id,
          permissionId: permissionId,
          isActive: true
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
        update: { isActive: true },
        create: {
          roleId: managerRole.id,
          permissionId: permissionId,
          isActive: true
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
        update: { isActive: true },
        create: {
          roleId: cashierRole.id,
          permissionId: permissionId,
          isActive: true
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
      role: 'ADMIN'
    },
    create: {
      email: 'admin@pos.com',
      name: 'System',
      lastname: 'Administrator',
      password: adminPassword,
      role: 'ADMIN',
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
    update: { isActive: true },
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
      isActive: true
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
      role: 'MANAGER'
    },
    create: {
      email: 'manager@pos.com',
      name: 'Store',
      lastname: 'Manager',
      password: managerPassword,
      role: 'MANAGER',
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
    update: { isActive: true },
    create: {
      userId: managerUser.id,
      roleId: managerRole.id,
      isActive: true
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
      role: 'CASHIER'
    },
    create: {
      email: 'cashier@pos.com',
      name: 'Store',
      lastname: 'Cashier',
      password: cashierPassword,
      role: 'CASHIER',
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
    update: { isActive: true },
    create: {
      userId: cashierUser.id,
      roleId: cashierRole.id,
      isActive: true
    }
  })

  console.log('✅ Created users with role assignments')

  // Step 5: Create categories
  console.log('📂 Creating categories...')
  
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      color: '#3B82F6',
    },
  })

  const food = await prisma.category.upsert({
    where: { name: 'Food & Beverages' },
    update: {},
    create: {
      name: 'Food & Beverages',
      color: '#10B981',
    },
  })

  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: {
      name: 'Clothing',
      color: '#F59E0B',
    },
  })

  // Create sample products
  const products = [
    {
      name: 'Wireless Headphones',
      description: 'Premium bluetooth headphones with noise cancellation',
      price: 99.99,
      cost: 45.00,
      sku: 'WH-001',
      barcode: '1234567890123',
      stock: 25,
      categoryId: electronics.id,
    },
    {
      name: 'Coffee Beans',
      description: 'Premium arabica coffee beans - 1kg bag',
      price: 24.99,
      cost: 12.00,
      sku: 'CB-001',
      barcode: '2345678901234',
      stock: 50,
      categoryId: food.id,
    },
    {
      name: 'Cotton T-Shirt',
      description: '100% organic cotton t-shirt',
      price: 19.99,
      cost: 8.00,
      sku: 'TS-001',
      barcode: '3456789012345',
      stock: 100,
      categoryId: clothing.id,
    },
    {
      name: 'Smartphone Case',
      description: 'Protective case for smartphones',
      price: 15.99,
      cost: 5.00,
      sku: 'SC-001',
      barcode: '4567890123456',
      stock: 75,
      categoryId: electronics.id,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
  }

  // Create a sample customer
  await prisma.customer.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
      ruc: '12345678901', // Sample RUC number
    },
  })

  // Create payment methods
  await prisma.paymentMethod.upsert({
    where: { name: 'Cash' },
    update: {},
    create: {
      name: 'Cash',
      description: 'Cash payment',
    },
  })

  await prisma.paymentMethod.upsert({
    where: { name: 'Credit Card' },
    update: {},
    create: {
      name: 'Credit Card',
      description: 'Credit card payment',
    },
  })

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
