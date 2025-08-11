import { Sale } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { generateInvoiceData } from '@/lib/utils/invoice-generator'

export interface CreateSaleData {
  total: number
  subtotal: number
  tax?: number
  discount?: number
  userId: string
  customerId?: string
  paymentMethodId: string
  notes?: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

export class SaleController {
  /**
   * Get next invoice sequence number from database
   */
  async getNextInvoiceSequence(): Promise<number> {
    try {
      // Get the latest sale to determine next sequence
      const latestSale = await prisma.sale.findFirst({
        orderBy: {
          invoiceSequence: 'desc'
        },
        select: {
          invoiceSequence: true
        }
      })

      // If no sales exist, start with 1
      if (!latestSale) {
        return 1
      }

      // Return next sequence number
      return latestSale.invoiceSequence + 1
    } catch (error) {
      console.error('Error getting next invoice sequence:', error)
      // Fallback: use timestamp-based sequence
      return Math.floor(Date.now() / 1000) % 10000000
    }
  }

  /**
   * Generate invoice number with database sequence
   */
  async generateInvoiceNumber(prefix = '001', middle = '001'): Promise<{
    saleNumber: string
    invoicePrefix: string
    invoiceMiddle: string
    invoiceSequence: number
  }> {
    const sequence = await this.getNextInvoiceSequence()
    const saleNumber = `${prefix}-${middle}-${sequence.toString().padStart(7, '0')}`
    
    return {
      saleNumber,
      invoicePrefix: prefix,
      invoiceMiddle: middle,
      invoiceSequence: sequence
    }
  }

  /**
   * Create a new sale with invoice number
   */
  async createSale(data: CreateSaleData): Promise<Sale> {
    try {
      // Generate invoice number
      const invoiceData = await this.generateInvoiceNumber()

      // Create sale in transaction
      const sale = await prisma.$transaction(async (tx) => {
        // Create the sale
        const newSale = await tx.sale.create({
          data: {
            saleNumber: invoiceData.saleNumber,
            invoicePrefix: invoiceData.invoicePrefix,
            invoiceMiddle: invoiceData.invoiceMiddle,
            invoiceSequence: invoiceData.invoiceSequence,
            total: data.total,
            subtotal: data.subtotal,
            tax: data.tax || 0,
            discount: data.discount || 0,
            userId: data.userId,
            customerId: data.customerId,
            paymentMethodId: data.paymentMethodId,
            notes: data.notes
          }
        })

        // Create sale items
        if (data.items && data.items.length > 0) {
          await tx.saleItem.createMany({
            data: data.items.map(item => ({
              ...item,
              saleId: newSale.id
            }))
          })
        }

        return newSale
      })

      return sale
    } catch (error) {
      console.error('Error creating sale:', error)
      throw error
    }
  }

  /**
   * Get sale by ID with items
   */
  async getSaleById(saleId: string): Promise<Sale | null> {
    try {
      return await prisma.sale.findUnique({
        where: { id: saleId },
        include: {
          saleItems: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          customer: true,
          paymentMethod: true
        }
      })
    } catch (error) {
      console.error('Error fetching sale:', error)
      return null
    }
  }

  /**
   * Get sales history
   */
  async getSalesHistory(limit = 50, offset = 0): Promise<Sale[]> {
    try {
      return await prisma.sale.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          saleItems: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          customer: true,
          paymentMethod: true
        }
      })
    } catch (error) {
      console.error('Error fetching sales history:', error)
      return []
    }
  }

  /**
   * Get sales by user
   */
  async getSalesByUser(userId: string, limit = 50): Promise<Sale[]> {
    try {
      return await prisma.sale.findMany({
        where: { userId },
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          saleItems: {
            include: {
              product: true
            }
          },
          customer: true,
          paymentMethod: true
        }
      })
    } catch (error) {
      console.error('Error fetching user sales:', error)
      return []
    }
  }
}
