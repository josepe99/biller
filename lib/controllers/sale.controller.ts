import { SaleDatasource, saleDatasource } from '@/lib/datasources/sale.datasource'
import { CheckoutController } from './checkout.controller'
import { BaseController } from './base.controller'
import type { InvoiceFilters } from '@/lib/types/invoices'

export class SaleController extends BaseController<SaleDatasource> {
  constructor() {
    super(saleDatasource)
  }

  /**
   * Creates a sale and updates the related checkout's invoiceSequence.
   * @param saleData - Sale data, including items and payments.
   */
  async create(saleData: any) {
    const checkoutController = new CheckoutController()
    const checkoutId = saleData.sale.checkoutId

    // 1. Create the sale
    const [sale, checkout] = await Promise.all([
      this.datasource.create(saleData),
      checkoutController.getById(checkoutId),
    ])

    await checkoutController.update(checkoutId, {
      invoiceSequence: checkout.invoiceSequence + 1,
    })

    return sale
  }

  async getBySaleNumber(saleNumber: string) {
    return this.datasource.getBySaleNumber(saleNumber)
  }

  async getSalesHistory(userId: string, limit = 50, offset = 0) {
    return this.datasource.getSalesHistory(userId, limit, offset)
  }

  async getInvoices(filters: InvoiceFilters = {}, limit = 50, offset = 0) {
    return this.datasource.getInvoicesWithFilters(filters, limit, offset)
  }

  async getInvoiceCashiers() {
    return this.datasource.getInvoiceCashiers()
  }

  async searchSales(query: string, limit = 20) {
    return this.datasource.searchSales(query, limit)
  }
}
