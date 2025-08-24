import { SaleDatasource, saleDatasource } from '@/lib/datasources/sale.datasource';
import { CheckoutController } from './checkout.controller';
import { BaseController } from './base.controller';
import { prisma } from '@/lib/prisma';

export class SaleController extends BaseController<SaleDatasource> {
  constructor() {
    super(saleDatasource);
  }

  /**
   * Creates a sale and updates the related checkout's invoiceSequence.
   * @param saleData - Sale data, including items and payments.
   */
  async create(saleData: any) {
    const checkoutController = new CheckoutController();
    const checkoutId = saleData.sale.checkoutId;

    // 1. Create the sale
    const [sale, checkout] = await Promise.all([
      this.datasource.create(saleData),
      checkoutController.getById(checkoutId),
    ]);

    await checkoutController.update(checkoutId, {
      invoiceSequence: checkout.invoiceSequence + 1,
    })

    return sale;
  }

  async getByInvoice(saleNumber: string) {
    return this.datasource.getByInvoice(saleNumber);
  }

  async getSalesHistory(userId: string, limit = 50, offset = 0) {
    return this.datasource.getSalesHistory(userId, limit, offset);
  }

  async searchSales(query: string, limit = 20) {
    return this.datasource.searchSales(query, limit);
  }
}
