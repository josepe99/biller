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
      !p.name.includes('system:')
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
      (p.resource === 'sales' && ['create', 'read'].includes(p.action)) ||
      // Product viewing only
      (p.resource === 'products' && p.action === 'read') ||
      // Category viewing only
      (p.resource === 'categories' && p.action === 'read') ||
      // Cash register operations
      (p.resource === 'cashRegister' && ['create', 'read'].includes(p.action)) ||
      // Checkout operations
      (p.resource === 'checkout' && ['create', 'read'].includes(p.action)) ||
      // Credit notes creation and adjustments
      (p.resource === 'creditNotes' && ['create', 'read', 'update'].includes(p.action))
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
      isPrincipal: true,
      deletedAt: null,
      invoicePrefix: '001',
      invoiceMiddle: '001',
      invoiceSequence: 0
    },
    {
      name: 'Caja 2',
      description: 'Caja secundaria - Sector A',
      isPrincipal: false,
      deletedAt: null,
      invoicePrefix: '001',
      invoiceMiddle: '002',
      invoiceSequence: 0
    },
    {
      name: 'Caja 3',
      description: 'Caja express - Compras rápidas',
      isPrincipal: false,
      deletedAt: null,
      invoicePrefix: '001',
      invoiceMiddle: '003',
      invoiceSequence: 0
    },
    {
      name: 'Caja 4',
      description: 'Caja primer piso',
      isPrincipal: false,
      deletedAt: null,
      invoicePrefix: '001',
      invoiceMiddle: '004',
      invoiceSequence: 0
    },
    {
      name: 'Caja 5',
      description: 'Caja autoservicio',
      isPrincipal: false,
      deletedAt: null,
      invoicePrefix: '001',
      invoiceMiddle: '005',
      invoiceSequence: 0
    },
  ]

  for (const checkout of checkouts) {
    const safeCheckout = {
      ...checkout,
      invoiceSequence: typeof checkout.invoiceSequence === 'number' && checkout.invoiceSequence !== null ? checkout.invoiceSequence : 0,
    };
    await prisma.checkout.upsert({
      where: { name: checkout.name },
      update: {},
      create: safeCheckout,
    })
  }

  console.log('✅ Created 5 checkout points (Caja 1-5)')

  // Step 7: Create product categories
  console.log('📁 Creating product categories...')

  const categories = [
    {
      name: 'Bebidas',
      deletedAt: null,
    },
    {
      name: 'Lácteos',
      deletedAt: null,
    },
    {
      name: 'Panadería',
      deletedAt: null,
    },
    {
      name: 'Carnes',
      deletedAt: null,
    },
    {
      name: 'Frutas y Verduras',
      deletedAt: null,
    },
    {
      name: 'Limpieza',
      deletedAt: null,
    },
    {
      name: 'Electrónica',
      deletedAt: null,
    },
  ]

  const createdCategories = new Map()

  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
    createdCategories.set(category.name, createdCategory.id)
  }

  console.log(`✅ Created ${categories.length} product categories`)

  // Step 8: Create products
  console.log('🛒 Creating products...')

  const products = [
    {
      name: 'Agua Mineral 500ml',
      description: 'Agua mineral sin gas en botella de 500ml',
      barcode: '7790001001',
      price: 1.50,
      cost: 0.75,
      iva: 10, // IVA en Paraguay (10%)
      unity: 'UN' as const,
      categoryName: 'Bebidas',
      stock: 100,
      deletedAt: null,
    },
    {
      name: 'Refresco Cola 2L',
      description: 'Bebida gaseosa sabor cola',
      barcode: '7790001002',
      price: 3.25,
      cost: 1.80,
      iva: 10,
      unity: 'UN' as const,
      categoryName: 'Bebidas',
      stock: 80,
      deletedAt: null,
    },
    {
      name: 'Leche Entera 1L',
      description: 'Leche entera pasteurizada',
      barcode: '7790002001',
      price: 2.30,
      cost: 1.60,
      iva: 5, // IVA reducido para alimentos básicos
      unity: 'L' as const,
      categoryName: 'Lácteos',
      stock: 50,
      deletedAt: null,
    },
    {
      name: 'Queso Fresco 500g',
      description: 'Queso fresco tradicional',
      barcode: '7790002002',
      price: 4.75,
      cost: 3.25,
      iva: 5,
      unity: 'G' as const,
      categoryName: 'Lácteos',
      stock: 30,
      deletedAt: null,
    },
    {
      name: 'Pan Blanco',
      description: 'Pan blanco de molde',
      barcode: '7790003001',
      price: 2.10,
      cost: 1.20,
      iva: 5,
      unity: 'UN' as const,
      categoryName: 'Panadería',
      stock: 40,
      deletedAt: null,
    },
    {
      name: 'Croissant',
      description: 'Croissant de mantequilla',
      barcode: '7790003002',
      price: 1.25,
      cost: 0.60,
      iva: 5,
      unity: 'UN' as const,
      categoryName: 'Panadería',
      stock: 25,
      deletedAt: null,
    },
    {
      name: 'Carne Molida 500g',
      description: 'Carne molida de res',
      barcode: '7790004001',
      price: 5.99,
      cost: 4.20,
      iva: 5,
      unity: 'G' as const,
      categoryName: 'Carnes',
      stock: 20,
      deletedAt: null,
    },
    {
      name: 'Pollo Entero',
      description: 'Pollo entero fresco',
      barcode: '7790004002',
      price: 8.50,
      cost: 6.25,
      iva: 5,
      unity: 'KG' as const,
      categoryName: 'Carnes',
      stock: 15,
      deletedAt: null,
    },
    {
      name: 'Manzanas Rojas 1kg',
      description: 'Manzanas rojas frescas',
      barcode: '7790005001',
      price: 2.99,
      cost: 1.80,
      iva: 5,
      unity: 'KG' as const,
      categoryName: 'Frutas y Verduras',
      stock: 45,
      deletedAt: null,
    },
    {
      name: 'Tomates 1kg',
      description: 'Tomates frescos',
      barcode: '7790005002',
      price: 2.50,
      cost: 1.40,
      iva: 5,
      unity: 'KG' as const,
      categoryName: 'Frutas y Verduras',
      stock: 35,
      deletedAt: null,
    },
    {
      name: 'Detergente Líquido 1L',
      description: 'Detergente líquido para ropa',
      barcode: '7790006001',
      price: 4.20,
      cost: 2.80,
      iva: 10,
      unity: 'L' as const,
      categoryName: 'Limpieza',
      stock: 40,
      deletedAt: null,
    },
    {
      name: 'Papel Higiénico 4 rollos',
      description: 'Paquete de papel higiénico',
      barcode: '7790006002',
      price: 3.75,
      cost: 2.25,
      iva: 10,
      unity: 'PACK' as const,
      categoryName: 'Limpieza',
      stock: 60,
      deletedAt: null,
    },
    {
      name: 'Audífonos Bluetooth',
      description: 'Audífonos inalámbricos con bluetooth',
      barcode: '7790007001',
      price: 25.99,
      cost: 15.50,
      iva: 10,
      unity: 'UN' as const,
      categoryName: 'Electrónica',
      stock: 10,
      deletedAt: null,
    },
    {
      name: 'Cargador USB-C',
      description: 'Cargador rápido con cable USB-C',
      barcode: '7790007002',
      price: 12.50,
      cost: 7.20,
      iva: 10,
      unity: 'UN' as const,
      categoryName: 'Electrónica',
      stock: 15,
      deletedAt: null,
    },
  ]

  for (const product of products) {
    const categoryId = createdCategories.get(product.categoryName)
    if (!categoryId) continue

    const { categoryName, ...productData } = product

    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: {
        ...productData,
        categoryId
      },
    })
  }

  console.log(`✅ Created ${products.length} products`)

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
