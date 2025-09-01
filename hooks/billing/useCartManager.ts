import {
  calculateItemDetails,
  calculateCartTotals
} from '@/lib/utils/cart-calculations'
import { Product, CartItem } from '@/lib/types'
import { useState } from 'react'



export function useCartManager() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null)

  const addProductToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, ...calculateItemDetails(product, newQuantity) }
            : item
        )
      } else {
        return [...prevCart, { ...product, ...calculateItemDetails(product, 1) }]
      }
    })
    setLastAddedProductId(product.id)
    setTimeout(() => setLastAddedProductId(null), 1000)
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(item => item.id === id)
      if (!itemToUpdate) return prevCart
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== id)
      } else {
        return prevCart.map(item =>
          item.id === id
            ? { ...item, ...calculateItemDetails(itemToUpdate, newQuantity) }
            : item
        )
      }
    })
  }

  const handleRemoveItem = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const resetCart = () => setCart([])

  const cartTotals = calculateCartTotals(cart)

  return {
    cart,
    setCart,
    addProductToCart,
    handleQuantityChange,
    handleRemoveItem,
    resetCart,
    lastAddedProductId,
    cartTotals
  }
}
