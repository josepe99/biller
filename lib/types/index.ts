import { UserRole } from '@prisma/client'

export interface Product {
  id: string
  barcode: string
  name: string
  price: number // Precio con IVA incluido
  stock: number
  category: string
  iva: number
  discount: number // Descuento en porcentaje (por defecto 0)
}

export interface CartItem extends Product {
  quantity: number
  subtotal: number // Subtotal de este item (cantidad * precio sin IVA - calculado desde precio con IVA)
  unitPriceWithIVA: number // Precio por unidad incluyendo IVA (igual al price del producto)
  unitIVAAmount: number // Monto de IVA por unidad
  lineTotalWithIVA: number // Total de esta línea incluyendo IVA
  lineIVAAmount: number // Total de IVA para esta línea
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  loginAttempts: number
  lockedUntil?: Date
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  refreshBefore: Date
  userId: string
  loggedAt: Date
  expiresAt: Date
  deletedAt?: Date | null
  userAgent?: string | null
  ipAddress?: string | null
  user?: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: AuthUser
  session?: Session
  error?: string
  permissions?: string[]
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Category {
  id: string
  name: string
}

export interface Checkout {
  id: string
  name: string
  description?: string | null
  isPrincipal?: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export interface CheckoutSummary extends Checkout {
  salesCount: number
  cashRegistersCount: number
}

export interface CheckoutWithSales extends Checkout {
  sales: Sale[]
  cashRegisters?: CashRegister[]
}

export interface CashRegister {
  id: string
  checkoutId: string
  openedById: string
  closedById?: string | null
  openedAt: Date
  closedAt?: Date | null
  status: string
  initialCash: number
  finalCash?: number | null
  totalSales?: number | null
  totalCash?: number | null
  totalCard?: number | null
  totalOther?: number | null
  expectedMoney?: {
    cash?: number | null
    debitCard?: number | null
    creditCard?: number | null
    tigoMoney?: number | null
    personalPay?: number | null
    bankTransfer?: number | null
    qrPayment?: number | null
    crypto?: number | null
    cheque?: number | null
    other?: number | null
  } | null
  missingMoney?: {
    cash?: number | null
    debitCard?: number | null
    creditCard?: number | null
    tigoMoney?: number | null
    personalPay?: number | null
    bankTransfer?: number | null
    qrPayment?: number | null
    crypto?: number | null
    cheque?: number | null
    other?: number | null
  } | null
  openingNotes?: string | null
  closingNotes?: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  openedBy: {
    name: string
    lastname: string
  }
  closedBy?: {
    name: string
    lastname: string
  } | null
}

export interface Sale {
  id: string
  saleNumber: string
  invoicePrefix: string
  invoiceMiddle: string
  invoiceSequence: number
  total: number
  subtotal: number
  tax: number
  discount: number
  status: string
  paymentMethodId: string
  userId: string
  customerId?: string | null
  checkoutId: string
  cashRegisterId?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}
