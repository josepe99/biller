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

interface BillingModuleProps {
  saleByInvoice?: any;
}

export default function BillingModule({ saleByInvoice }: BillingModuleProps) {
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

  // If saleByInvoice exists, show all its details in a modern, orange-accented, two-column card layout
  if (saleByInvoice) {
    // Import icons inline to avoid import issues in this block
    const { Receipt, User, UserCircle, FileText, Calendar, BadgeDollarSign, StickyNote } = require('lucide-react');
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow p-0 md:p-6 border">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-4 mb-4">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              <Receipt className="text-orange-500 h-6 w-6" />
              <span className="text-2xl font-bold text-orange-500">Factura #{saleByInvoice.saleNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-5 w-5" />
              <span>{saleByInvoice.createdAt ? new Date(saleByInvoice.createdAt).toLocaleString() : '-'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="font-semibold">Cajero:</span>
                <span>{saleByInvoice.user?.name || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-gray-400" />
                <span className="font-semibold">Cliente:</span>
                <span>{saleByInvoice.customer?.name || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="font-semibold">RUC Cliente:</span>
                <span>{saleByInvoice.customer?.ruc || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-gray-400" />
                <span className="font-semibold">Notas:</span>
                <span>{saleByInvoice.notes || '-'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Subtotal:</span>
                <span>{saleByInvoice.subtotal?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">IVA:</span>
                <span>{saleByInvoice.tax?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold text-orange-500">
                <BadgeDollarSign className="h-6 w-6" />
                <span>Total:</span>
                <span>{saleByInvoice.total?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Estado:</span>
                <span className={
                  saleByInvoice.status === 'COMPLETED'
                    ? 'text-green-600 font-semibold'
                    : 'text-gray-600 font-semibold'
                }>{saleByInvoice.status}</span>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="font-semibold text-lg mb-2 text-gray-700">Items</div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Producto</th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-600">Cantidad</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Precio Unitario</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {saleByInvoice.saleItems?.map((item: any) => (
                    <tr key={item.id} className="border-t hover:bg-orange-50">
                      <td className="px-4 py-2">{item.product?.name || '-'}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">{item.unitPrice?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}</td>
                      <td className="px-4 py-2 text-right">{item.total?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
