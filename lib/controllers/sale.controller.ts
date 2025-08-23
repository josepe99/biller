import { SaleDatasource, saleDatasource } from '@/lib/datasources/sale.datasource';
import { BaseController } from './base.controller';

export class SaleController extends BaseController<SaleDatasource> {
  constructor() {
    super(saleDatasource);
  }

  async getByInvoice(saleNumber: string) {
    return this.datasource.getByInvoice(saleNumber);
  }

  async getSalesHistory(limit = 50, offset = 0) {
    return this.datasource.getSalesHistory(limit, offset);
  }

  async searchSales(query: string, limit = 20) {
    return this.datasource.searchSales(query, limit);
  }
}
