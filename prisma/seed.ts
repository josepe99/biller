import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create categories
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

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: {
      email: 'admin@pos.com',
      name: 'Admin User',
      role: 'ADMIN',
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

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
