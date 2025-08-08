export interface Product {
  id: string
  name: string
  price: number // Precio sin IVA
  stock: number
  category: string
  ivaType: '5%' | '10%' // Tipo de IVA para el producto
}

export interface CartItem extends Product {
  quantity: number
  subtotal: number // Subtotal de este item (cantidad * precio sin IVA)
  unitPriceWithIVA: number // Precio por unidad incluyendo IVA
  unitIVAAmount: number // Monto de IVA por unidad
  lineTotalWithIVA: number // Total de esta línea incluyendo IVA
  lineIVAAmount: number // Total de IVA para esta línea
}

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'CASHIER'
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
  userAgent?: string
  ipAddress?: string
  user?: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: User
  session?: Session
  error?: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'CASHIER'
}

export interface Category {
  id: string
  name: string
}
