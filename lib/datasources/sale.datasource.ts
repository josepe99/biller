import { BaseDatasource } from './base.datasource';
import { prisma } from '@/lib/prisma';


export class SaleDatasource extends BaseDatasource<'sale'> {
  constructor() {
    super('sale');
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

  async getSalesHistory(limit = 50, offset = 0) {
    return await prisma.sale.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        saleItems: { include: { product: true } },
        user: true,
        customer: true,
      },
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
