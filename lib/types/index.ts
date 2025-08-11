import { UserRole } from '@prisma/client'

export interface Product {
  id: string
  barcode: number
  name: string
  price: number // Precio con IVA incluido
  stock: number
  category: string
  iva: number
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
  isActive: boolean
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
