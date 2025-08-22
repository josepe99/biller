import { Product, CartItem } from '@/lib/types'

export const calculateItemDetails = (product: Product, quantity: number) => {
  const ivaRate = product.iva === 5 ? 0.05 : 0.10
  const unitPriceWithIVA = product.price // El precio almacenado ya incluye IVA
  const unitPriceWithoutIVA = product.price / (1 + ivaRate) // Calculamos el precio sin IVA
  const unitIVAAmount = unitPriceWithIVA - unitPriceWithoutIVA
  const subtotal = quantity * unitPriceWithoutIVA // Base subtotal without IVA
  const lineIVAAmount = quantity * unitIVAAmount
  const lineTotalWithIVA = quantity * unitPriceWithIVA

  return {
    quantity,
    subtotal,
    unitPriceWithIVA,
    unitIVAAmount,
    lineIVAAmount,
    lineTotalWithIVA,
  }
}

export const calculateCartTotals = (cart: CartItem[]) => {
  const subtotalWithoutIva = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const iva5PercentAmount = cart
    .filter(item => item.iva === 5)
    .reduce((sum, item) => sum + (item.lineTotalWithIVA / 21), 0)
  const iva10PercentAmount = cart
    .filter(item => item.iva === 10)
    .reduce((sum, item) => sum + (item.lineTotalWithIVA / 11), 0)
  const totalIvaAmount = iva5PercentAmount + iva10PercentAmount
  const total = cart.reduce((sum, item) => sum + item.lineTotalWithIVA, 0)

  return {
    subtotalWithoutIva,
    iva5PercentAmount,
    iva10PercentAmount,
    totalIvaAmount,
    total
  }
}
