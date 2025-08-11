'use server'

import { CustomerController } from '@/lib/controllers/customer.controller'

/**
 * Server action for getting customer by RUC
 */
export async function getCustomerByRucAction(ruc: string): Promise<{ success: boolean; customer?: any; error?: string }> {
  try {
    if (!ruc || ruc.trim() === '') {
      return { success: false, error: 'RUC is required' }
    }

    const customerController = new CustomerController()
    const customer = await customerController.findByRuc(ruc)

    if (!customer) {
      return { success: false, error: 'Customer not found' }
    }

    return {
      success: true,
      customer
    }
  } catch (error) {
    console.error('Error fetching customer by RUC:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Server action for searching customers
 */
export async function searchCustomersAction(searchTerm: string, limit: number = 10): Promise<{ success: boolean; customers?: any[]; error?: string }> {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return { success: false, error: 'Search term is required' }
    }

    const customerController = new CustomerController()
    const customers = await customerController.searchCustomers(searchTerm, limit)

    return {
      success: true,
      customers
    }
  } catch (error) {
    console.error('Error searching customers:', error)
    return { success: false, error: 'Internal server error' }
  }
}
