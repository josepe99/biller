import { useState } from 'react'
import { findCustomerByRuc } from '@/lib/actions/customerActions'

export function useCustomerManager() {
  const [customerRuc, setCustomerRuc] = useState<string>('')
  const [customerInfo, setCustomerInfo] = useState<any>(null)

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
      setCustomerInfo(null)
      return null
    }
  }

  const handleCustomerRucChange = async (ruc: string) => {
    setCustomerRuc(ruc)
    if (ruc.length >= 7) {
      await searchCustomerByRuc(ruc)
    } else {
      setCustomerInfo(null)
    }
  }

  const resetCustomer = () => {
    setCustomerRuc('')
    setCustomerInfo(null)
  }

  return {
    customerRuc,
    setCustomerRuc,
    customerInfo,
    setCustomerInfo,
    searchCustomerByRuc,
    handleCustomerRucChange,
    resetCustomer
  }
}
