import { CashRegister } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class CashRegisterDatasource {
  async getAll(): Promise<CashRegister[]> {
    return prisma.cashRegister.findMany();
  }

  async getById(id: string): Promise<CashRegister | null> {
    return prisma.cashRegister.findUnique({ where: { id } });
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
    finalCash: number;
    closingNotes?: string;
    closedAt?: Date;
    totalSales?: number;
    totalCash?: number;
    totalCard?: number;
    totalOther?: number;
    expectedCash?: number;
    cashDifference?: number;
  }): Promise<CashRegister> {
    return prisma.cashRegister.update({
      where: { id: params.id },
      data: {
        closedById: params.closedById,
        finalCash: params.finalCash,
        closingNotes: params.closingNotes,
        closedAt: params.closedAt ?? new Date(),
        status: 'CLOSED',
        totalSales: params.totalSales,
        totalCash: params.totalCash,
        totalCard: params.totalCard,
        totalOther: params.totalOther,
        expectedCash: params.expectedCash,
        cashDifference: params.cashDifference,
      },
    });
  }

  async getActives(): Promise<CashRegister[]> {
    return prisma.cashRegister.findMany({ where: { status: 'OPEN' } });
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
}
