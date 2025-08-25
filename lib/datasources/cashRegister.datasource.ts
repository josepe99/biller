import { CashRegister, Checkout } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class CashRegisterDatasource {
  async getAll(): Promise<(CashRegister & { checkout: Checkout })[]> {
    return prisma.cashRegister.findMany({
      include: { checkout: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string): Promise<CashRegister | null> {
    return prisma.cashRegister.findUnique({
      where: { id },
      include: {
        checkout: { select: {name: true, id: true} },
        openedBy: { select: { name: true } },
        closedBy: { select: { name: true } },

      }
    });
  }

  async openCheckout(params: {
    checkoutId: string;
    openedById: string;
    initialCash: number;
    openingNotes?: string;
    openedAt?: Date;
  }): Promise<CashRegister> {
    return prisma.cashRegister.create({
      data: {
        checkoutId: params.checkoutId,
        openedById: params.openedById,
        initialCash: params.initialCash,
        openingNotes: params.openingNotes,
        openedAt: params.openedAt ?? new Date(),
        status: 'OPEN',
      },
    });
  }

  async closeCheckout(params: {
    id: string;
    closedById: string;
    closingNotes?: string;
    closedAt?: Date;
    totalSales?: number;
    totalCash?: number;
    totalCard?: number;
    totalOther?: number;
  // expectedMoney and missingMoney are computed server-side and may be present in params
  }): Promise<CashRegister> {
    const p: any = params as any;
    const updateData: any = {
      closedById: params.closedById,
            // finalCash is intentionally not set here - final amounts are stored per payment method
      closingNotes: params.closingNotes,
      closedAt: params.closedAt ?? new Date(),
      status: 'CLOSED',
      expectedMoney: p.expectedMoney,
      missingMoney: p.missingMoney,
    };

    return prisma.cashRegister.update({ where: { id: params.id }, data: updateData });
  }

  async getActives(): Promise<(CashRegister & { checkout: Checkout })[]> {
    return prisma.cashRegister.findMany({
      where: { status: 'OPEN' },
      include: { checkout: true },
    });
  }

  async getByUser(userId: string): Promise<CashRegister[]> {
    return prisma.cashRegister.findMany({
      where: {
        OR: [
          { openedById: userId },
          { closedById: userId },
        ],
      },
    });
  }


  async update(id: string, data: Partial<CashRegister>): Promise<CashRegister> {
    return prisma.cashRegister.update({ where: { id }, data });
  }

  async delete(id: string): Promise<CashRegister> {
    return prisma.cashRegister.delete({ where: { id } });
  }

  getActiveByUser(userId: string): Promise<CashRegister & { checkout: Checkout | null } | null> {
    return prisma.cashRegister.findFirst({
      where: {
        status: 'OPEN',
        openedById: userId,
      },
      include: { checkout: true },
    });
  }
}
