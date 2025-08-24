import { BaseDatasource } from './base.datasource';
import { prisma } from '@/lib/prisma';



export class SaleDatasource extends BaseDatasource<'sale'> {
  constructor() {
    super('sale');
  }

  /**
   * Creates a sale, its items, and its transactions (multi-payment).
   * @param saleData - Sale data, including items and payments.
   * @returns The created sale with items and transactions.
   */
  async create(saleData: {
    sale: {
      saleNumber: string;
      invoicePrefix?: string;
      invoiceMiddle?: string;
      invoiceSequence: number;
      total: number;
      subtotal: number;
      tax?: number;
      discount?: number;
      status?: import('@prisma/client').SaleStatus;
      userId: string;
      customerId?: string;
      checkoutId: string;
      cashRegisterId?: string;
      notes?: string;
      createdAt?: Date;
      updatedAt?: Date;
      deletedAt?: Date | null;
    },
    items: Array<{
      quantity: number;
      unitPrice: number;
      total: number;
      productId: string;
    }>,
    payments: Array<{
      paymentMethod: import('@prisma/client').PaymentMethod;
      movement: import('@prisma/client').MovementType;
      description?: string;
      amount: number;
      userId?: string;
      checkoutId?: string;
      cashRegisterId?: string;
      createdAt?: Date;
      updatedAt?: Date;
      deletedAt?: Date | null;
    }>,
  }) {
    return await prisma.sale.create({
      data: {
        ...saleData.sale,
        deletedAt: null,
        saleItems: {
          create: saleData.items.map(({ quantity, unitPrice, total, productId }) => ({
            quantity,
            unitPrice,
            total,
            product: { connect: { id: productId } },
          })),
        },
        transactions: {
          create: saleData.payments,
        },
      },
      include: {
        saleItems: true,
        transactions: true,
      },
    });
  }

  async getByInvoice(saleNumber: string) {
    return await prisma.sale.findUnique({
      where: { saleNumber, deletedAt: null },
      include: {
        saleItems: { include: { product: true } },
        user: true,
        customer: true,
      },
    });
  }

  async getById(id: string) {
    return await prisma.sale.findUnique({
      where: { id, deletedAt: null },
      include: {
        saleItems: { include: { product: true } },
        user: true,
        customer: true,
      },
    });
  }

  async getSalesHistory(userId: string, limit = 50, offset = 0) {
    console.log("userid: ", userId)
    return await prisma.sale.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        saleItems: { include: { product: true } },
        user: true,
        customer: true,
      },
      where: { deletedAt: null, userId: userId },
    });
  }

  /**
 * Busca ventas por coincidencia parcial en saleNumber, ruc o nombre del cliente
 */
  async searchSales(query: string, limit = 20) {
    return await prisma.sale.findMany({
      where: {
        deletedAt: null,
        OR: [
          { saleNumber: { contains: query, mode: 'insensitive' } },
          {
            customer: {
              OR: [
                { ruc: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } }
              ]
            }
          }
        ]
      },
      include: {
        saleItems: { include: { product: true } },
        user: true,
        customer: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const saleDatasource = new SaleDatasource();
