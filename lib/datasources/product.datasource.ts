import { prisma } from '../prisma';

export class ProductDatasource {
  async getAllProducts() {
    return prisma.product.findMany({
      include: {
        category: true,
      },
    });
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: {
        category: true
      }
    });
    
    if (!product) return null;
    
    // Transform the data to match the frontend Product type
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category?.name || 'Sin categoría',
      ivaType: '10%' as const // Default IVA type, you can make this configurable later
    };
  }

  async createProduct(data: any) {
    return prisma.product.create({ data });
  }

  async updateProduct(id: string, data: any) {
    return prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}
