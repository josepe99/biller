import { CashRegisterDatasource } from '@/lib/datasources/cashRegister.datasource';
import { CashRegister } from '@prisma/client';

export class CashRegisterController {
  private cashRegisterDatasource: CashRegisterDatasource;

  constructor() {
    this.cashRegisterDatasource = new CashRegisterDatasource();
  }

  async getAll() {
    return this.cashRegisterDatasource.getAll();
  }

  async getActiveByUser(userId: string) {
    return this.cashRegisterDatasource.getActiveByUser(userId);
  }

  async getById(id: string) {
    return this.cashRegisterDatasource.getById(id);
  }

  async openCheckout(params: {
    checkoutId: string;
    openedById: string;
    initialCash: number;
    openingNotes?: string;
    openedAt?: Date;
  }) {
    return this.cashRegisterDatasource.openCheckout(params);
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
    return this.cashRegisterDatasource.closeCheckout(params);
  }

  async getByUser(userId: string) {
    return this.cashRegisterDatasource.getByUser(userId);
  }

  async update(id: string, data: Partial<CashRegister>) {
    return this.cashRegisterDatasource.update(id, data);
  }

  async delete(id: string) {
    return this.cashRegisterDatasource.delete(id);
  }
}
