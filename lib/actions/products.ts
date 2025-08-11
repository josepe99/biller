
import { ProductController } from '@/lib/controllers/product.controller';

const productController = new ProductController();

export async function getProductsAction() {
  return productController.getAllProducts();
}

export async function getProductByIdAction(id: string) {
  return productController.getProductById(id);
}

export async function addProductAction(data: any) {
  return productController.createProduct(data);
}

export async function editProductAction(id: string, data: any) {
  return productController.updateProduct(id, data);
}

export async function removeProductAction(id: string) {
  return productController.deleteProduct(id);
}
