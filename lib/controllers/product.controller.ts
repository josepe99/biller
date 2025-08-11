import { ProductDatasource } from '@/lib/datasources/product.datasource';

export class ProductController {
  private productDatasource: ProductDatasource;

  constructor() {
    this.productDatasource = new ProductDatasource();
  }

  async getAllProducts() {
    return await this.productDatasource.getAllProducts();
  }

  async getProductById(id: string) {
    return await this.productDatasource.getProductById(id);
  }

  async createProduct(data: any) {
    return await this.productDatasource.createProduct(data);
  }

  async updateProduct(id: string, data: any) {
    return await this.productDatasource.updateProduct(id, data);
  }

  async deleteProduct(id: string) {
    return await this.productDatasource.deleteProduct(id);
  }
}
