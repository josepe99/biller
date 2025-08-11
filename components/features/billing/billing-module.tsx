'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Trash2, DollarSign, X, History, ArrowLeft, ArrowRight, User, Receipt } from 'lucide-react'
import { Product, CartItem } from '@/lib/types'
import { sampleProducts } from '@/lib/data/sample-data'
import { calculateItemDetails, calculateCartTotals } from '@/lib/utils/cart-calculations'
import { generateInvoiceData } from '@/lib/utils/invoice-generator'
import { formatParaguayanCurrency, formatNumberWithDots } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { getCustomerByRucAction } from '@/lib/actions/customers'
import ProductSearchModal from './product-search-modal'

export default function BillingModule() {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('') // For main barcode input
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState<string>('')
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1)
  const [customerRuc, setCustomerRuc] = useState<string>('')
  const [customerInfo, setCustomerInfo] = useState<any>(null)
  const [historySearchTerm, setHistorySearchTerm] = useState<string>('')
  const [filteredHistory, setFilteredHistory] = useState<any[]>([])
  const [searchType, setSearchType] = useState<'invoice' | 'ruc'>('invoice')

  // Calculate totals based on the original price (without IVA) for consistency with tax breakdown
  const cartTotals = calculateCartTotals(cart)
  const { subtotalWithoutIva, iva5PercentAmount, iva10PercentAmount, totalIvaAmount, total } = cartTotals

  // Generate invoice number on component mount
  useEffect(() => {
    const initializeInvoice = async () => {
      await generateInvoiceNumber()
      loadInvoiceHistory()
    }
    initializeInvoice()
  }, [])

  const generateInvoiceNumber = async () => {
    try {
      const invoiceData = await generateInvoiceData()
      setCurrentInvoiceNumber(invoiceData.saleNumber)
    } catch (error) {
      console.error('Error generating invoice number:', error)
      // Fallback to simple format if generation fails
      const sequence = Math.floor(Math.random() * 9999999) + 1
      const fallbackNumber = `001-001-${sequence.toString().padStart(7, '0')}`
      setCurrentInvoiceNumber(fallbackNumber)
    }
  }

  const loadInvoiceHistory = async () => {
    try {
      // TODO: Implement API call to fetch invoice history
      // For now, we'll use mock data with new format and RUC
      const mockHistory = [
        {
          id: '1',
          invoiceNumber: '001-001-0000001',
          total: 125000,
          date: new Date('2024-08-10'),
          cashier: 'María González',
          customerRuc: '80012345-1',
          customerName: 'Juan Pérez S.A.',
          items: [
            { name: 'Coca Cola 500ml', quantity: 2, unitPrice: 8000, total: 16000 },
            { name: 'Pan de molde', quantity: 1, unitPrice: 12000, total: 12000 }
          ]
        },
        {
          id: '2',
          invoiceNumber: '001-001-0000002',
          total: 75000,
          date: new Date('2024-08-10'),
          cashier: 'Juan Pérez',
          customerRuc: '80087654-3',
          customerName: 'María González',
          items: [
            { name: 'Leche entera 1L', quantity: 3, unitPrice: 9500, total: 28500 }
          ]
        },
        {
          id: '3',
          invoiceNumber: '001-001-0000003',
          total: 45000,
          date: new Date('2024-08-09'),
          cashier: 'Ana López',
          customerRuc: '80012345-1',
          customerName: 'Juan Pérez S.A.',
          items: [
            { name: 'Agua mineral 1L', quantity: 5, unitPrice: 9000, total: 45000 }
          ]
        }
      ]
      setInvoiceHistory(mockHistory)
      setFilteredHistory(mockHistory)
    } catch (error) {
      console.error('Error loading invoice history:', error)
    }
  }

  const searchCustomerByRuc = async (ruc: string) => {
    try {
      const result = await getCustomerByRucAction(ruc)
      
      if (result.success && result.customer) {
        setCustomerInfo(result.customer)
        return result.customer
      } else {
        setCustomerInfo(null)
        return null
      }
    } catch (error) {
      console.error('Error searching customer by RUC:', error)
      setCustomerInfo(null)
      return null
    }
  }

  const handleCustomerRucChange = async (ruc: string) => {
    setCustomerRuc(ruc)
    if (ruc.length >= 8) { // Basic RUC length validation
      await searchCustomerByRuc(ruc)
    } else {
      setCustomerInfo(null)
    }
  }

  const filterInvoiceHistory = (searchTerm: string, type: 'invoice' | 'ruc') => {
    if (!searchTerm.trim()) {
      setFilteredHistory(invoiceHistory)
      return
    }

    const filtered = invoiceHistory.filter(invoice => {
      if (type === 'invoice') {
        return invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      } else if (type === 'ruc') {
        return invoice.customerRuc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      }
      return false
    })

    setFilteredHistory(filtered)
  }

  const handleHistorySearch = () => {
    filterInvoiceHistory(historySearchTerm, searchType)
  }

  // Update filtered history when search term or type changes
  useEffect(() => {
    filterInvoiceHistory(historySearchTerm, searchType)
  }, [historySearchTerm, searchType, invoiceHistory])



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

  const handleConfirmPayment = async () => {
    // Create invoice record
    const newInvoice = {
      id: Date.now().toString(),
      invoiceNumber: currentInvoiceNumber,
      total: total,
      date: new Date(),
      cashier: user?.name || 'Usuario Desconocido',
      customerRuc: customerRuc || null,
      customerName: customerInfo?.name || null,
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPriceWithIVA,
        total: item.lineTotalWithIVA
      }))
    }
    
    // Add to history
    setInvoiceHistory(prev => [newInvoice, ...prev])
    setFilteredHistory(prev => [newInvoice, ...prev])
    
    alert(`Venta realizada con éxito!\nFactura: ${currentInvoiceNumber}${customerInfo ? `\nCliente: ${customerInfo.name}` : ''}`)
    setCart([])
    setCustomerRuc('')
    setCustomerInfo(null)
    setIsPaymentModalOpen(false)
    
    // Generate new invoice number for next sale
    await generateInvoiceNumber()
  }

  const handleConfirmCancel = async () => {
    setCart([])
    setCustomerRuc('')
    setCustomerInfo(null)
    setIsCancelModalOpen(false)
    // Generate new invoice number when canceling
    await generateInvoiceNumber()
  }

  const showPreviousInvoice = () => {
    if (invoiceHistory.length > 0 && currentHistoryIndex < invoiceHistory.length - 1) {
      setCurrentHistoryIndex(prev => prev + 1)
    }
  }

  const showNextInvoice = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(prev => prev - 1)
    } else if (currentHistoryIndex === 0) {
      setCurrentHistoryIndex(-1) // Return to current sale
    }
  }

  const getCurrentDisplayData = () => {
    if (currentHistoryIndex === -1) {
      // Current sale
      return {
        invoiceNumber: currentInvoiceNumber,
        cashier: user?.name || 'Usuario Desconocido',
        items: cart,
        total: total,
        isCurrentSale: true
      }
    } else {
      // Historical invoice
      const invoice = invoiceHistory[currentHistoryIndex]
      return {
        invoiceNumber: invoice.invoiceNumber,
        cashier: invoice.cashier,
        items: invoice.items.map((item: any) => ({
          ...item,
          id: `${invoice.id}-${item.name}`, // Generate ID for display
          lineTotalWithIVA: item.total,
          unitPriceWithIVA: item.unitPrice
        })),
        total: invoice.total,
        isCurrentSale: false,
        date: invoice.date
      }
    }
  }

  const displayData = getCurrentDisplayData()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-orange-500">Facturación</CardTitle>
            <div className="flex items-center gap-4">
              {/* Botón Anterior - siempre visible si hay historial y no estamos en la factura más antigua */}
              {invoiceHistory.length > 0 && currentHistoryIndex < invoiceHistory.length - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showPreviousInvoice}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              
              {/* Botón Actual - siempre visible si hay historial y no estamos viendo la venta actual */}
              {invoiceHistory.length > 0 && currentHistoryIndex !== -1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentHistoryIndex(-1)}
                  className="text-green-600 hover:text-green-700"
                >
                  Actual
                </Button>
              )}
              
              {/* Botón Siguiente - siempre visible si hay historial y no estamos en la venta actual */}
              {invoiceHistory.length > 0 && currentHistoryIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showNextInvoice}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-gray-600 hover:text-gray-700"
              >
                <History className="h-4 w-4 mr-1" />
                Historial
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Receipt className="h-4 w-4" />
                <span>Factura: {displayData.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Cajero: {displayData.cashier}</span>
              </div>
              {!displayData.isCurrentSale && displayData.date && (
                <div className="flex items-center gap-1">
                  <span>Fecha: {new Date(displayData.date).toLocaleDateString('es-PY')}</span>
                </div>
              )}
            </div>
            {!displayData.isCurrentSale && (
              <Badge variant="secondary" className="w-fit">
                Visualizando factura anterior
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          {displayData.isCurrentSale && (
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
          )}
          <div className="flex-grow overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Código</TableHead>
                  <TableHead>Artículo</TableHead>
                  <TableHead className="w-[120px] text-right">Importe</TableHead>
                  <TableHead className="w-[100px] text-center">IVA</TableHead>
                  <TableHead className="w-[120px] text-center">Cantidad</TableHead>
                  {displayData.isCurrentSale && (
                    <TableHead className="w-[60px] text-center">Acción</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={displayData.isCurrentSale ? 6 : 5} className="text-center text-muted-foreground py-8">
                      {displayData.isCurrentSale ? 'No hay artículos en el carrito.' : 'No hay artículos en esta factura.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayData.items.map((item: any) => (
                    <TableRow 
                      key={item.id} 
                      className={lastAddedProductId === item.id ? 'bg-orange-50 transition-colors duration-500' : ''}
                    >
                      <TableCell className="font-mono text-sm">
                        {item.id || item.code || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatParaguayanCurrency(item.unitPriceWithIVA || item.unitPrice || 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.ivaType === 'IVA 10%' ? 'default' : 'secondary'} className="text-xs">
                          {item.ivaType === 'IVA 10%' ? '10' : item.ivaType === 'IVA 5%' ? '5' : '10'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {displayData.isCurrentSale ? (
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
                        ) : (
                          <span className="font-medium">{item.quantity}</span>
                        )}
                      </TableCell>
                      {displayData.isCurrentSale && (
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      )}
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
          <CardTitle className="text-orange-500">
            {displayData.isCurrentSale ? 'Resumen de Venta' : 'Resumen de Factura'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div className="space-y-2 text-lg">
            {displayData.isCurrentSale && (
              <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Cliente</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">RUC del Cliente (opcional)</label>
                    <Input
                      placeholder="Ej: 80012345-1"
                      value={customerRuc}
                      onChange={(e) => handleCustomerRucChange(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  {customerInfo && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                      <p className="font-medium">{customerInfo.name}</p>
                      <p>RUC: {customerInfo.ruc}</p>
                      {customerInfo.phone && <p>Tel: {customerInfo.phone}</p>}
                    </div>
                  )}
                  {customerRuc && !customerInfo && customerRuc.length >= 8 && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      Cliente no encontrado. La factura se emitirá sin datos del cliente.
                    </div>
                  )}
                </div>
              </div>
            )}

            {displayData.isCurrentSale ? (
              <>
                <div className="flex justify-between">
                  <span>Subtotal (sin IVA):</span>
                  <span className="font-medium">{formatParaguayanCurrency(subtotalWithoutIva)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento:</span>
                  <span className="font-medium">Gs 0</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA 5%:</span>
                  <span className="font-medium">{formatParaguayanCurrency(iva5PercentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA 10%:</span>
                  <span className="font-medium">{formatParaguayanCurrency(iva10PercentAmount)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-muted-foreground mb-4">
                  <p>Factura procesada</p>
                  <p className="text-sm">
                    {displayData.date && new Date(displayData.date).toLocaleString('es-PY')}
                  </p>
                </div>
                {(displayData as any).customerRuc && (
                  <div className="mb-4 p-3 border rounded-lg bg-blue-50">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">Cliente</h4>
                    <p className="text-sm font-medium">{(displayData as any).customerName}</p>
                    <p className="text-xs text-blue-600">RUC: {(displayData as any).customerRuc}</p>
                  </div>
                )}
              </>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-2xl font-bold text-orange-500 pt-2">
              <span>Total:</span>
              <span>{formatParaguayanCurrency(displayData.total)}</span>
            </div>
          </div>
          {displayData.isCurrentSale && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="col-span-2 bg-orange-500 hover:bg-orange-600 text-lg py-6"
                    disabled={cart.length === 0}
                  >
                    <DollarSign className="mr-2 h-5 w-5" /> Pagar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Pago</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro de que deseas procesar el pago por un total de **{formatParaguayanCurrency(total)}**?
                      <br />
                      <strong>Factura: {currentInvoiceNumber}</strong>
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
          )}
        </CardContent>
      </Card>

      <ProductSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onProductSelect={handleProductSelection}
        initialSearchTerm={searchTerm}
      />

      {/* Invoice History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de Facturas</DialogTitle>
            <DialogDescription>
              Buscar y revisar facturas procesadas
            </DialogDescription>
          </DialogHeader>
          
          {/* Search Controls */}
          <div className="space-y-4 border-b pb-4">
            <div className="flex gap-2 items-center">
              <div className="flex gap-1">
                <Button
                  variant={searchType === 'invoice' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchType('invoice')}
                  className="text-xs"
                >
                  Por Factura
                </Button>
                <Button
                  variant={searchType === 'ruc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchType('ruc')}
                  className="text-xs"
                >
                  Por RUC/Cliente
                </Button>
              </div>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder={
                    searchType === 'invoice' 
                      ? "Buscar por número de factura (ej: 001-001-0000001)"
                      : "Buscar por RUC o nombre del cliente"
                  }
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  className="text-sm"
                />
                <Button 
                  onClick={handleHistorySearch}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {historySearchTerm && (
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  {filteredHistory.length} de {invoiceHistory.length} facturas
                  {searchType === 'invoice' ? ' por número' : ' por cliente'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setHistorySearchTerm('')
                    setFilteredHistory(invoiceHistory)
                  }}
                  className="text-xs"
                >
                  Limpiar búsqueda
                </Button>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {historySearchTerm ? (
                  <div>
                    <p>No se encontraron facturas que coincidan con la búsqueda</p>
                    <p className="text-sm mt-1">"{historySearchTerm}"</p>
                  </div>
                ) : (
                  <p>No hay facturas en el historial</p>
                )}
              </div>
            ) : (
              filteredHistory.map((invoice, index) => (
                <Card key={invoice.id} className="border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{invoice.invoiceNumber}</h4>
                          <Badge variant="outline" className="text-xs">
                            {invoice.customerRuc ? 'Con Cliente' : 'Sin Cliente'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <span className="font-medium">Fecha:</span> {new Date(invoice.date).toLocaleString('es-PY')}
                          </p>
                          <p>
                            <span className="font-medium">Cajero:</span> {invoice.cashier}
                          </p>
                          {invoice.customerRuc && (
                            <div className="bg-blue-50 p-2 rounded text-blue-800">
                              <p className="font-medium">{invoice.customerName}</p>
                              <p className="text-xs">RUC: {invoice.customerRuc}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-500 mb-2">
                          Gs {invoice.total.toLocaleString('es-PY')}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentHistoryIndex(invoiceHistory.findIndex(h => h.id === invoice.id))
                            setIsHistoryModalOpen(false)
                          }}
                          className="text-xs"
                        >
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Artículos ({invoice.items.length})</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {invoice.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} unidades
                        </span>
                      </div>
                      <div className="space-y-1">
                        {invoice.items.slice(0, 2).map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="flex justify-between text-xs">
                            <span>• {item.name} (x{item.quantity})</span>
                            <span>Gs {item.total.toLocaleString('es-PY')}</span>
                          </div>
                        ))}
                        {invoice.items.length > 2 && (
                          <p className="text-xs text-gray-500 italic">
                            ... y {invoice.items.length - 2} artículos más
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
