export type InvoiceStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

export interface InvoiceFilters {
  cashierId?: string | null
  statuses?: InvoiceStatus[] | null
  dateFrom?: string | null
  dateTo?: string | null
  minTotal?: number | null
  maxTotal?: number | null
  search?: string | null
}

export interface InvoiceQuery extends InvoiceFilters {
  limit?: number
  offset?: number
}

export interface InvoiceCashierOption {
  id: string
  name: string
  lastname: string | null
}

export interface InvoiceListItem {
  id: string
  saleNumber: string
  total: number
  subtotal: number
  tax: number
  discount: number
  status: InvoiceStatus
  createdAt: string
  cashier: InvoiceCashierOption
  customer: {
    id: string
    name: string | null
    ruc: string | null
  } | null
  checkout: {
    id: string
    name: string | null
  } | null
}

export interface InvoiceListResponse {
  invoices: InvoiceListItem[]
  totalCount: number
}

export const INVOICE_STATUS_OPTIONS: InvoiceStatus[] = [
  'PENDING',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
]
