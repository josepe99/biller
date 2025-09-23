"use server"

import { SaleController } from '@/lib/controllers/sale.controller'
import type {
  InvoiceCashierOption,
  InvoiceListItem,
  InvoiceListResponse,
  InvoiceQuery,
  InvoiceStatus,
} from '@/lib/types/invoices'

export async function getSalesHistoryAction(userId: string, limit = 50, offset = 0) {
  const saleController = new SaleController()
  return saleController.getSalesHistory(userId, limit, offset)
}

export async function searchSalesAction(query: string, limit = 20) {
  const saleController = new SaleController()
  return saleController.searchSales(query, limit)
}

export async function createSaleAction(data: Parameters<SaleController['create']>[0]) {
  const saleController = new SaleController()
  return saleController.create(data)
}

export async function getSaleBySaleNumber(saleNumber: string) {
  const saleController = new SaleController()
  return saleController.getBySaleNumber(saleNumber)
}

export async function getInvoicesAction(query: InvoiceQuery = {}): Promise<InvoiceListResponse> {
  const saleController = new SaleController()
  const { limit = 50, offset = 0, ...filters } = query
  const { sales, totalCount } = await saleController.getInvoices(filters, limit, offset)

  const invoices: InvoiceListItem[] = (sales ?? []).map((sale: any) => {
    const createdAt = sale?.createdAt instanceof Date ? sale.createdAt.toISOString() : new Date().toISOString()
    const status = (sale?.status ?? 'PENDING') as InvoiceStatus

    return {
      id: String(sale?.id ?? ''),
      saleNumber: String(sale?.saleNumber ?? ''),
      total: Number(sale?.total ?? 0),
      subtotal: Number(sale?.subtotal ?? 0),
      tax: Number(sale?.tax ?? 0),
      discount: Number(sale?.discount ?? 0),
      status,
      createdAt,
      cashier: {
        id: String(sale?.user?.id ?? ''),
        name: String(sale?.user?.name ?? 'Sin asignar'),
        lastname: sale?.user?.lastname ?? null,
      },
      customer: sale?.customer
        ? {
            id: String(sale.customer.id ?? ''),
            name: sale.customer.name ?? null,
            ruc: sale.customer.ruc ?? null,
          }
        : null,
      checkout: sale?.checkout
        ? {
            id: String(sale.checkout.id ?? ''),
            name: sale.checkout.name ?? null,
          }
        : null,
    }
  })

  return {
    invoices,
    totalCount: Number(totalCount ?? 0),
  }
}

export async function getInvoiceCashiersAction(): Promise<InvoiceCashierOption[]> {
  const saleController = new SaleController()
  const users = await saleController.getInvoiceCashiers()

  return (users ?? []).map((user: any) => ({
    id: String(user?.id ?? ''),
    name: String(user?.name ?? ''),
    lastname: user?.lastname ?? null,
  }))
}
