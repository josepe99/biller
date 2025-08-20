'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import ProductSearchModal from './product-search-modal'
import { BillingHeader } from './ui/BillingHeader'
import { BillingTable } from './ui/BillingTable'
import { BillingSummary } from './ui/BillingSummary'
import { InvoiceHistoryModal } from './ui/InvoiceHistoryModal'
import { Product } from '@/lib/types'

// Define CartItem type locally if not exported from '@/lib/types'
type CartItem = Product & {
  quantity: number
  unitPriceWithIVA: number
  lineTotalWithIVA: number
}
import { sampleProducts } from '@/lib/data/sample-data'
import { calculateItemDetails, calculateCartTotals } from '@/lib/utils/cart-calculations'
import { generateInvoiceData } from '@/lib/utils/invoice-generator'
import { formatParaguayanCurrency } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { getCustomerByRucAction } from '@/lib/actions/customers'

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
    }
    initializeInvoice()
  }, [])

  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([])
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
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(prev => prev - 1)
    } else if (currentHistoryIndex === 0) {
      setCurrentHistoryIndex(-1) // Volver a la venta actual
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
        <BillingHeader
          invoiceHistory={invoiceHistory}
          currentHistoryIndex={currentHistoryIndex}
          showPreviousInvoice={showPreviousInvoice}
          showNextInvoice={showNextInvoice}
          setCurrentHistoryIndex={setCurrentHistoryIndex}
          setIsHistoryModalOpen={setIsHistoryModalOpen}
          displayData={displayData}
        />
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
          <BillingTable
            items={displayData.items}
            isCurrentSale={displayData.isCurrentSale}
            lastAddedProductId={lastAddedProductId}
            handleQuantityChange={handleQuantityChange}
            handleRemoveItem={handleRemoveItem}
          />
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardContent>
          <BillingSummary
            displayData={displayData}
            cart={cart}
            iva5PercentAmount={iva5PercentAmount}
            iva10PercentAmount={iva10PercentAmount}
            total={total}
            customerRuc={customerRuc}
            customerInfo={customerInfo}
            handleCustomerRucChange={handleCustomerRucChange}
            isPaymentModalOpen={isPaymentModalOpen}
            setIsPaymentModalOpen={setIsPaymentModalOpen}
            isCancelModalOpen={isCancelModalOpen}
            setIsCancelModalOpen={setIsCancelModalOpen}
            handleConfirmPayment={handleConfirmPayment}
            handleConfirmCancel={handleConfirmCancel}
            currentInvoiceNumber={currentInvoiceNumber}
            formatParaguayanCurrency={formatParaguayanCurrency}
          />
        </CardContent>
      </Card>

      <ProductSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onProductSelect={handleProductSelection}
        initialSearchTerm={searchTerm}
      />

      <InvoiceHistoryModal
        isOpen={isHistoryModalOpen}
        setIsOpen={setIsHistoryModalOpen}
        searchType={searchType}
        setSearchType={setSearchType}
        historySearchTerm={historySearchTerm}
        setFilteredHistory={setFilteredHistory}
        handleHistorySearch={handleHistorySearch}
        setCurrentHistoryIndex={setCurrentHistoryIndex}
      />
    </div>
  )
}
