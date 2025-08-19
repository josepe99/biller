import { ProductDatasource } from '@/lib/datasources/product.datasource';

export class ProductController {

  /**
   * Busca productos por coincidencia parcial en nombre o código de barras
   * @param query texto a buscar
   */
  async searchProducts(query: string) {
    return await this.productDatasource.searchProducts(query);
  }
  private productDatasource: ProductDatasource;

  constructor() {
    this.productDatasource = new ProductDatasource();
  }


  async getAllProducts(limit?: number) {
    return await this.productDatasource.getAllProducts(limit);
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

  async lowStockCount(threshold?: number) {
    return await this.productDatasource.lowStockCount(threshold);
  }
}
