'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Search, Trash2, DollarSign, X } from 'lucide-react'
import { Product, CartItem } from '@/lib/types'
import { sampleProducts } from '@/lib/data/sample-data'
import { calculateItemDetails, calculateCartTotals } from '@/lib/utils/cart-calculations'
import ProductSearchModal from './product-search-modal'

export default function BillingModule() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('') // For main barcode input
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  // Calculate totals based on the original price (without IVA) for consistency with tax breakdown
  const cartTotals = calculateCartTotals(cart)
  const { subtotalWithoutIva, iva5PercentAmount, iva10PercentAmount, totalIvaAmount, total } = cartTotals



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

  const handleMainSearch = () => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim()
    if (!lowerCaseSearchTerm) {
      setIsSearchModalOpen(true)
      return
    }

    // Try to find exact barcode match
    const exactProduct = sampleProducts.find(p => p.id.toLowerCase() === lowerCaseSearchTerm)

    if (exactProduct) {
      addProductToCart(exactProduct)
      setSearchTerm('')
      setIsSearchModalOpen(false)
    } else {
      setIsSearchModalOpen(true)
    }
  }

  const handleProductSelection = (product: Product) => {
    addProductToCart(product)
    setIsSearchModalOpen(false)
    setSearchTerm('')
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

  const handleConfirmPayment = () => {
    alert('Venta realizada con éxito!')
    setCart([])
    setIsPaymentModalOpen(false)
  }

  const handleConfirmCancel = () => {
    setCart([])
    setIsCancelModalOpen(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle className="text-orange-500">Facturación</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Buscar por código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleMainSearch()}
              className="flex-grow"
            />
            <Button onClick={handleMainSearch} className="bg-orange-500 hover:bg-orange-600">
              <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
          </div>
          <div className="flex-grow overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead className="w-[120px] text-right">Precio (con IVA)</TableHead>
                  <TableHead className="w-[100px] text-right">IVA (unidad)</TableHead>
                  <TableHead className="w-[120px] text-center">Cantidad</TableHead>
                  <TableHead className="w-[120px] text-right">Subtotal (con IVA)</TableHead>
                  <TableHead className="w-[60px] text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No hay artículos en el carrito.
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className={lastAddedProductId === item.id ? 'bg-orange-50 transition-colors duration-500' : ''}
                    >
                      <TableCell className="font-medium">
                        {item.name} 
                        <Badge variant="outline" className="ml-2">{item.ivaType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">Gs {item.unitPriceWithIVA.toFixed(0)}</TableCell>
                      <TableCell className="text-right">Gs {item.unitIVAAmount.toFixed(0)}</TableCell>
                      <TableCell className="text-center">
                        <Input 
                          type="number" 
                          value={isNaN(item.quantity) ? '' : item.quantity} 
                          onChange={(e) => { 
                            const parsedQuantity = parseInt(e.target.value)
                            handleQuantityChange(item.id, isNaN(parsedQuantity) ? 0 : parsedQuantity)
                          }} 
                          className="w-20 text-center" 
                          min="0" 
                        />
                      </TableCell>
                      <TableCell className="text-right">Gs {item.lineTotalWithIVA.toFixed(0)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-orange-500">Resumen de Venta</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div className="space-y-2 text-lg">
            <div className="flex justify-between">
              <span>Subtotal (sin IVA):</span>
              <span className="font-medium">Gs {subtotalWithoutIva.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Descuento:</span>
              <span className="font-medium">Gs 0</span>
            </div>
            <div className="flex justify-between">
              <span>IVA 5%:</span>
              <span className="font-medium">Gs {iva5PercentAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA 10%:</span>
              <span className="font-medium">Gs {iva10PercentAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-orange-500 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>Gs {total.toFixed(0)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
              <DialogTrigger asChild>
                <Button className="col-span-2 bg-orange-500 hover:bg-orange-600 text-lg py-6">
                  <DollarSign className="mr-2 h-5 w-5" /> Pagar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Pago</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que deseas procesar el pago por un total de **Gs {total.toFixed(0)}**?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handleConfirmPayment} className="bg-orange-500 hover:bg-orange-600">Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="hover:bg-red-50 hover:text-red-600">
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Cancelación</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que deseas cancelar la venta actual? Se perderán todos los artículos en el carrito.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>No</Button>
                  <Button onClick={handleConfirmCancel} className="bg-red-500 hover:bg-red-600">Sí, Cancelar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <ProductSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onProductSelect={handleProductSelection}
        initialSearchTerm={searchTerm}
      />
    </div>
  )
}
