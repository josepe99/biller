const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testProductCreation() {
  try {
    console.log('🧪 Testing product creation with categoryId...');
    
    // First, get or create a category
    let category = await prisma.category.findFirst({
      where: { name: 'Hogar' }
    });
    
    if (!category) {
      console.log('📂 Creating test category: Hogar');
      category = await prisma.category.create({
        data: {
          name: 'Hogar',
          color: '#4CAF50'
        }
      });
    }
    
    console.log('✅ Category found/created:', category.name, 'with ID:', category.id);
    
    // Now test product creation with categoryId
    const productData = {
      barcode: "12345",
      name: "Vaso stanley",
      price: 100000,
      stock: 3,
      categoryId: category.id, // Using categoryId instead of category
      iva: 10
    };
    
    console.log('📦 Creating product with data:', productData);
    
    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true
      }
    });
    
    console.log('✅ Product created successfully!');
    console.log('Product ID:', product.id);
    console.log('Product Name:', product.name);
    console.log('Product Category:', product.category?.name);
    console.log('Product Barcode:', product.barcode);
    
    // Clean up - delete the test product
    await prisma.product.delete({
      where: { id: product.id }
    });
    
    console.log('🧹 Test product cleaned up');
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductCreation();
