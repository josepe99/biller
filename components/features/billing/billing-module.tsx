'use client'

import { useCashRegister } from '@/components/checkout/CashRegisterContext'
import { useCustomerManager } from '@/hooks/billing/useCustomerManager'
import { usePaymentManager } from '@/hooks/billing/usePaymentManager'
import { useInvoiceManager } from '@/hooks/billing/useInvoiceManager'
import { useCartManager } from '@/hooks/billing/useCartManager'
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
import { useState } from 'react'


export default function BillingModule() {
  const { user } = useAuth()
  const { checkout } = useCashRegister()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  // Cart logic
  const {
    cart,
    addProductToCart,
    handleQuantityChange,
    handleRemoveItem,
    resetCart,
    lastAddedProductId,
    cartTotals
  } = useCartManager()

  // Customer logic
  const {
    customerRuc,
    customerInfo,
    handleCustomerRucChange,
    resetCustomer
  } = useCustomerManager()

  // Invoice logic
  const {
    currentInvoiceNumber,
    invoiceHistory,
    currentHistoryIndex,
    setCurrentHistoryIndex,
    handleGenerateInvoiceNumber,
    showPreviousInvoice,
    showNextInvoice
  } = useInvoiceManager(checkout)

  // Payment logic
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isCancelModalOpen,
    setIsCancelModalOpen,
    handleConfirmPayment,
    handleConfirmCancel
  } = usePaymentManager({
    user,
    checkout,
    cart,
    customerInfo,
    currentInvoiceNumber,
    cartTotals,
    handleGenerateInvoiceNumber,
    resetCart,
    resetCustomer
  })

  const { iva5PercentAmount, iva10PercentAmount, total } = cartTotals

  // Main search logic (remains here, as it's UI orchestration)
  const handleMainSearch = () => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim()
    if (!lowerCaseSearchTerm) {
      setIsSearchModalOpen(true)
      return
    }
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

  const getCurrentDisplayData = () => {
    return {
      invoiceNumber: currentInvoiceNumber,
      cashier: user?.name,
      items: cart,
      total: total,
      isCurrentSale: true
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
            handleConfirmPayment={(payments) => handleConfirmPayment(payments, createSaleAction)}
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
      />
    </div>
  )
}
