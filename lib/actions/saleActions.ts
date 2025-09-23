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
  const cashiers = await saleController.getInvoiceCashiers()
  
  return (cashiers ?? []).map((cashier: any) => ({
    id: String(cashier?.id ?? ''),
    name: String(cashier?.name ?? 'Sin asignar'),
    lastname: cashier?.lastname ?? null,
  }))
}

/**
 * Updates the status of a sale
 */
export async function updateSaleStatusAction(saleId: string, status: string) {
  try {
    const saleController = new SaleController()
    const result = await saleController.updateStatus(saleId, status)
    return { success: true, sale: result }
  } catch (error) {
    console.error('Error updating sale status:', error)
    throw new Error('Failed to update sale status')
  }
}

/**
 * Updates the notes of a sale
 */
export async function updateSaleNotesAction(saleId: string, notes: string) {
  try {
    const saleController = new SaleController()
    const result = await saleController.updateNotes(saleId, notes)
    return { success: true, sale: result }
  } catch (error) {
    console.error('Error updating sale notes:', error)
    throw new Error('Failed to update sale notes')
  }
}

/**
 * Updates both status and notes of a sale
 */
export async function updateSaleAction(saleId: string, data: { status?: string; notes?: string }) {
  try {
    const saleController = new SaleController()
    const result = await saleController.updateSale(saleId, data)
    return { success: true, sale: result }
  } catch (error) {
    console.error('Error updating sale:', error)
    throw new Error('Failed to update sale')
  }
}
