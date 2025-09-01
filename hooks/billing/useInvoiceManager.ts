import { useState, useEffect } from 'react'
import { generateInvoiceNumber as buildInvoiceNumber } from '@/lib/utils/invoice-generator'

export function useInvoiceManager(checkout: any) {
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState<string>('')
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1)

  useEffect(() => {
    const initializeInvoice = async () => {
      await handleGenerateInvoiceNumber()
    }
    initializeInvoice()
    // eslint-disable-next-line
  }, [checkout])

  const handleGenerateInvoiceNumber = async () => {
    try {
      if (checkout?.invoicePrefix && checkout?.invoiceMiddle && typeof checkout?.invoiceSequence === 'number') {
        const invoiceNumber = buildInvoiceNumber({
          prefix: checkout.invoicePrefix,
          middle: checkout.invoiceMiddle,
          sequence: checkout.invoiceSequence
        })
        setCurrentInvoiceNumber(invoiceNumber)
        return
      }
    } catch (error) {
      // handle error
    }
  }

  const showPreviousInvoice = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(prev => prev - 1)
    } else if (currentHistoryIndex === 0) {
      setCurrentHistoryIndex(-1)
    }
  }

  const showNextInvoice = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(prev => prev - 1)
    } else if (currentHistoryIndex === 0) {
      setCurrentHistoryIndex(-1)
    }
  }

  return {
    currentInvoiceNumber,
    setCurrentInvoiceNumber,
    invoiceHistory,
    setInvoiceHistory,
    currentHistoryIndex,
    setCurrentHistoryIndex,
    handleGenerateInvoiceNumber,
    showPreviousInvoice,
    showNextInvoice
  }
}
