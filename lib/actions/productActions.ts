"use server"

import { ProductController } from '@/lib/controllers/product.controller';

const productController = new ProductController();


export async function getProductsAction(limit?: number) {
  try {
    return productController.getAllProducts(limit);
  } catch (error) {
    return [];
  }
}

export async function getProductByIdAction(id: string) {
  try {
    return productController.getProductById(id);
  } catch (error) {
    return null;
  }
}

export async function addProductAction(data: any) {
  try {
    const product = await productController.createProduct(data);
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

export async function editProductAction(id: string, data: any) {
  try {
    const product = await productController.updateProduct(id, data);
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

export async function removeProductAction(id: string) {
  try {
    await productController.deleteProduct(id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function getLowStockCountAction(threshold?: number) {
  try {
    const count = await productController.lowStockCount(threshold);
    return count;
  } catch (error) {
    console.error('Error getting low stock count:', error);
    return 0;
  }
}

export async function searchProductsAction(query: string) {
  try {
    return await productController.searchProducts(query);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}