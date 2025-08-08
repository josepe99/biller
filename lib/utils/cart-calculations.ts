import { Product, CartItem } from '@/lib/types'

export const calculateItemDetails = (product: Product, quantity: number) => {
  const ivaRate = product.ivaType === '5%' ? 0.05 : 0.10
  const unitPriceWithIVA = product.price * (1 + ivaRate)
  const unitIVAAmount = product.price * ivaRate
  const subtotal = quantity * product.price // Base subtotal without IVA
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
    .filter(item => item.ivaType === '5%')
    .reduce((sum, item) => sum + (item.subtotal * 0.05), 0)
  const iva10PercentAmount = cart
    .filter(item => item.ivaType === '10%')
    .reduce((sum, item) => sum + (item.subtotal * 0.10), 0)
  const totalIvaAmount = iva5PercentAmount + iva10PercentAmount
  const total = subtotalWithoutIva + totalIvaAmount

  return {
    subtotalWithoutIva,
    iva5PercentAmount,
    iva10PercentAmount,
    totalIvaAmount,
    total
  }
}
