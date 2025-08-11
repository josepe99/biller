import { Customer } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface CreateCustomerData {
  name: string
  email?: string
  phone?: string
  address?: string
  ruc?: string
}

export class CustomerController {
  /**
   * Search customer by RUC
   */
  async findByRuc(ruc: string): Promise<Customer | null> {
    try {
      if (!ruc || ruc.trim() === '') {
        return null
      }

      return await prisma.customer.findUnique({
        where: { 
          ruc: ruc.trim() 
        }
      })
    } catch (error) {
      console.error('Error searching customer by RUC:', error)
      return null
    }
  }

  /**
   * Search customers by name or RUC
   */
  async searchCustomers(searchTerm: string, limit = 10): Promise<Customer[]> {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return []
      }

      const term = searchTerm.trim()
      
      return await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { ruc: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } }
          ],
          deletedAt: null
        },
        take: limit,
        orderBy: {
          name: 'asc'
        }
      })
    } catch (error) {
      console.error('Error searching customers:', error)
      return []
    }
  }

  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    try {
      return await prisma.customer.create({
        data: {
          name: data.name.trim(),
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          address: data.address?.trim() || null,
          ruc: data.ruc?.trim() || null
        }
      })
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(id: string, data: Partial<CreateCustomerData>): Promise<Customer | null> {
    try {
      return await prisma.customer.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name.trim() }),
          ...(data.email !== undefined && { email: data.email?.trim() || null }),
          ...(data.phone !== undefined && { phone: data.phone?.trim() || null }),
          ...(data.address !== undefined && { address: data.address?.trim() || null }),
          ...(data.ruc !== undefined && { ruc: data.ruc?.trim() || null }),
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error updating customer:', error)
      return null
    }
  }

  /**
   * Get customer by ID
   */
  async getById(id: string): Promise<Customer | null> {
    try {
      return await prisma.customer.findUnique({
        where: { 
          id,
          deletedAt: null 
        }
      })
    } catch (error) {
      console.error('Error fetching customer:', error)
      return null
    }
  }

  /**
   * Get all customers with pagination
   */
  async getAllCustomers(limit = 50, offset = 0): Promise<Customer[]> {
    try {
      return await prisma.customer.findMany({
        where: {
          deletedAt: null
        },
        skip: offset,
        take: limit,
        orderBy: {
          name: 'asc'
        }
      })
    } catch (error) {
      console.error('Error fetching customers:', error)
      return []
    }
  }

  /**
   * Soft delete customer
   */
  async deleteCustomer(id: string): Promise<boolean> {
    try {
      await prisma.customer.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('Error deleting customer:', error)
      return false
    }
  }
}
