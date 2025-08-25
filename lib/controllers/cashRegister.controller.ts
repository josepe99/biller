import { CashRegisterDatasource } from '@/lib/datasources/cashRegister.datasource';
import { CashRegister, PaymentMethod } from '@prisma/client';
import { prisma } from '@/lib/prisma';

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
    closedById: string;// finalAmounts per payment method (camelCase keys)
    finalAmounts?: Record<string, number>;
    closingNotes?: string;
    closedAt?: Date;
    totalSales?: number;
    totalCash?: number;
    totalCard?: number;
    totalOther?: number;
    expectedMoney?: any;
    missingMoney?: any;
  }) {
    // Fetch existing cash register to get openedAt, checkoutId and openedById
    const existing = await this.cashRegisterDatasource.getById(params.id);
    if (!existing) throw new Error('CashRegister not found');

    const start = existing.openedAt;
    const end = params.closedAt ?? new Date();
    const checkoutId = existing.checkoutId;
    const userId = existing.openedById;

    // Helper: map PaymentMethod enum value to camelCase key
    const paymentMethodToKey = (pm: string) => {
      return pm.toLowerCase().split(/_|\s+/).map((part, idx) => idx === 0 ? part : part[0].toUpperCase() + part.slice(1)).join('');
    };

    // Query transactions in the time window, for the checkout and user
    const txs = await prisma.transaction.findMany({
      where: {
        checkoutId: checkoutId ?? undefined,
        userId: userId ?? undefined,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: { paymentMethod: true, amount: true },
    });

    const expected: Record<string, number> = {};
    for (const t of txs) {
      const key = paymentMethodToKey(String(t.paymentMethod));
      expected[key] = (expected[key] || 0) + (t.amount ?? 0);
    }

    // Include the cash register's initialCash as part of expected cash
    try {
      const initialCashAmount = (existing.initialCash as unknown as number) ?? 0;
      const cashKey = paymentMethodToKey(String(PaymentMethod.CASH));
      expected[cashKey] = (expected[cashKey] || 0) + initialCashAmount;
    } catch (e) {
      // In case PaymentMethod enum or existing.initialCash is not available, skip adding
    }

    // Attach computed expectedMoney to params (object with camelCase keys)
    params.expectedMoney = expected;

  // Compute missingMoney = expected - finalAmounts (per method)
    const missing: Record<string, number> = {};
    const finals = params.finalAmounts ?? {};
    // include all keys from expected and finals
    const keys = new Set<string>([...Object.keys(expected), ...Object.keys(finals)]);
    for (const k of keys) {
      const exp = expected[k] ?? 0;
      const fin = finals[k] ?? 0;
      missing[k] = Number((exp - fin) || 0);
    }
    params.missingMoney = missing;

    // Pass an explicit object to the datasource to ensure expectedMoney/missingMoney are included
    return this.cashRegisterDatasource.closeCheckout({
      id: params.id,
      closedById: params.closedById,
      closingNotes: params.closingNotes,
      closedAt: params.closedAt,
      totalSales: params.totalSales,
      totalCash: params.totalCash,
      totalCard: params.totalCard,
      totalOther: params.totalOther,
      // include computed values
      expectedMoney: expected,
      missingMoney: missing,
    } as any);
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
