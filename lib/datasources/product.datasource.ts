import { prisma } from '../prisma';

export class ProductDatasource {
  async getAllProducts() {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    // Transform the data to match the frontend Product type
    return products.map(product => ({
      id: product.id,
      barcode: product.barcode || '', // Keep as string
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category?.name || 'Sin categoría',
      iva: (product as any).iva || 10, // Safe fallback for iva field
      discount: (product as any).discount || 0,
    }));
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
      barcode: product.barcode || '', // Keep as string
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category?.name || 'Sin categoría',
      iva: (product as any).iva || 10 // Safe fallback for iva field
    };
  }

  async createProduct(data: any) {
    const product = await prisma.product.create({ 
      data,
      include: {
        category: true
      }
    });
    
    // Transform the data to match the frontend Product type
    return {
      id: product.id,
      barcode: product.barcode || '', // Keep as string
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category?.name || 'Sin categoría',
      iva: (product as any).iva || 10 // Safe fallback for iva field
    };
  }

  async updateProduct(id: string, data: any) {
    const product = await prisma.product.update({ 
      where: { id }, 
      data,
      include: {
        category: true
      }
    });
    
    // Transform the data to match the frontend Product type
    return {
      id: product.id,
      barcode: product.barcode || '', // Keep as string
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category?.name || 'Sin categoría',
      iva: (product as any).iva || 10,
      discount: (product as any).discount || 0,
    };
  }

  async deleteProduct(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}
