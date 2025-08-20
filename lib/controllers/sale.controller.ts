import { SaleDatasource, saleDatasource } from '@/lib/datasources/sale.datasource';
import { BaseController } from './base.controller';

export class SaleController extends BaseController<SaleDatasource> {
  saleDatasource: SaleDatasource;

  constructor() {
    super(new SaleDatasource())
    this.saleDatasource = new SaleDatasource();
  }

  /**
   * Busca ventas por coincidencia parcial en saleNumber, ruc o nombre del cliente
   */
  async searchSales(query: string, limit = 20) {
    return this.datasource.searchSales(query, limit);
  }

  async getSalesHistory(limit = 50, offset = 0) {
    return this.datasource.getSalesHistory();
  }
}
