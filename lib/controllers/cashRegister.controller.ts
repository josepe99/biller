import { CashRegisterDatasource } from '@/lib/datasources/cashRegister.datasource';
import { CashRegister } from '@prisma/client';

export class CashRegisterController {
  private datasource: CashRegisterDatasource;

  constructor() {
    this.datasource = new CashRegisterDatasource();
  }

  async getAll() {
    return this.datasource.getAll();
  }

  async getActiveByUser(userId: string) {
    return this.datasource.getActiveByUser(userId);
  }

  async getById(id: string) {
    return this.datasource.getById(id);
  }

  async openCheckout(params: {
    checkoutId: string;
    openedById: string;
    initialCash: number;
    openingNotes?: string;
    openedAt?: Date;
  }) {
    return this.datasource.openCheckout(params);
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
  }) {
    return this.datasource.closeCheckout(params);
  }

  async getByUser(userId: string) {
    return this.datasource.getByUser(userId);
  }

  async update(id: string, data: Partial<CashRegister>) {
    return this.datasource.update(id, data);
  }

  async delete(id: string) {
    return this.datasource.delete(id);
  }
}
