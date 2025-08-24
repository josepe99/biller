'use client'

import { useCashRegister } from '@/components/checkout/CashRegisterContext'
import { findCustomerByRuc } from '@/lib/actions/customerActions'
import { InvoiceHistoryModal } from './ui/InvoiceHistoryModal'
import { createSaleAction } from '@/lib/actions/saleActions'
import { Card, CardContent } from '@/components/ui/card'
import { sampleProducts } from '@/lib/data/sample-data'
import ProductSearchModal from './product-search-modal'
import { formatParaguayanCurrency } from '@/lib/utils'
import { BillingSummary } from './ui/BillingSummary'
import { BillingHeader } from './ui/BillingHeader'
import { BillingTable } from './ui/BillingTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { Search } from 'lucide-react'
import { Product } from '@/lib/types'
import {
  calculateItemDetails,
  calculateCartTotals
} from '@/lib/utils/cart-calculations'
import {
  generateInvoiceNumber as buildInvoiceNumber
} from '@/lib/utils/invoice-generator'
import { useState, useEffect } from 'react'

// Define CartItem type locally if not exported from '@/lib/types'
type CartItem = Product & {
  quantity: number
  unitPriceWithIVA: number
  lineTotalWithIVA: number
}

export default function BillingModule() {
  const { user } = useAuth()
  const { checkout } = useCashRegister()
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
      await handleGenerateInvoiceNumber()
    }
    initializeInvoice()
  }, [checkout])

  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([])

  const handleGenerateInvoiceNumber = async () => {
    try {
      if (checkout?.invoicePrefix && checkout?.invoiceMiddle && typeof checkout?.invoiceSequence === 'number') {
        const invoiceNumber = buildInvoiceNumber({
          prefix: checkout.invoicePrefix,
          middle: checkout.invoiceMiddle,
          sequence: checkout.invoiceSequence
        });
        setCurrentInvoiceNumber(invoiceNumber);
        return;
      }
    } catch (error) {
      console.error('Error generating invoice number from checkout:', error);
    }
  }

  const searchCustomerByRuc = async (ruc: string) => {
    try {
      const result = await findCustomerByRuc(ruc)

      if (result) {
        setCustomerInfo(result)
        return result
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
    if (ruc.length >= 7) { // Basic RUC length validation
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
        return invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleConfirmPayment = async (payments: { method: string; amount: number }[]) => {
    // Compose sale data for createSaleAction
    if (!user || !checkout) return;
    const saleData = {
      sale: {
        saleNumber: currentInvoiceNumber,
        invoicePrefix: checkout.invoicePrefix,
        invoiceMiddle: checkout.invoiceMiddle,
        invoiceSequence: checkout.invoiceSequence,
        total: total,
        subtotal: subtotalWithoutIva,
        tax: totalIvaAmount,
        discount: 0,
        status: 'COMPLETED',
        userId: user.id,
        customerId: customerInfo?.id,
        checkoutId: checkout.id,
        cashRegisterId: checkout.cashRegisterId,
        notes: '',
      },
      items: cart.map(item => ({
        quantity: item.quantity,
        unitPrice: item.unitPriceWithIVA,
        total: item.lineTotalWithIVA,
        productId: item.id,
      })),
      payments: payments.map(p => ({
        paymentMethod: p.method,
        movement: 'INCOME',
        amount: p.amount,
        userId: user.id,
        checkoutId: checkout.id,
        cashRegisterId: checkout.cashRegisterId,
      })),
    };
    await createSaleAction(saleData);
    setCart([]);
    setCustomerRuc('');
    setCustomerInfo(null);
    setIsPaymentModalOpen(false);
    await handleGenerateInvoiceNumber();

    window.location.reload();
  }

  const handleConfirmCancel = async () => {
    setCart([])
    setCustomerRuc('')
    setCustomerInfo(null)
    setIsCancelModalOpen(false)
    // Generate new invoice number when canceling
    await handleGenerateInvoiceNumber()
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
      return {
        invoiceNumber: currentInvoiceNumber,
        cashier: user?.name,
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
