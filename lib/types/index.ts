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
  role: 'admin' | 'cashier'
}

export interface Category {
  id: string
  name: string
}
