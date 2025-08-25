"use server"

import { CheckoutController } from '@/lib/controllers/checkout.controller';
import { prisma } from '@/lib/prisma';

const checkoutController = new CheckoutController();

export async function getCheckoutsAction() {
  try {
    return await checkoutController.getAllCheckouts();
  } catch (error) {
    console.error('Error fetching checkouts:', error);
    return [];
  }
}

export async function getCheckoutByIdAction(id: string) {
  try {
    return await checkoutController.getCheckoutById(id);
  } catch (error) {
    console.error('Error fetching checkout:', error);
    return null;
  }
}

export async function createCheckoutAction(data: {
  name: string;
  description?: string;
}) {
  try {
    const checkout = await checkoutController.create(data);
    return checkout;
  } catch (error) {
    console.error('Error creating checkout:', error);
    return null;
  }
}

export async function updateCheckoutAction(id: string, data: {
  name?: string;
  description?: string;
  location?: string;
  isActive?: boolean;
}) {
  try {
    const checkout = await checkoutController.update(id, data);
    return checkout;
  } catch (error) {
    console.error('Error updating checkout:', error);
    return null;
  }
}

export async function deleteCheckoutAction(id: string) {
  try {
    const checkout = await checkoutController.delete(id);
    return checkout;
  } catch (error) {
    console.error('Error deleting checkout:', error);
    return null;
  }
}

export async function getActiveCheckoutsAction() {
  try {
    return await checkoutController.getActiveCheckouts();
  } catch (error) {
    console.error('Error fetching active checkouts:', error);
    return [];
  }
}

export async function getCheckoutWithSalesAction(id: string) {
  try {
    return await checkoutController.getCheckoutWithSales(id);
  } catch (error) {
    console.error('Error fetching checkout with sales:', error);
    return null;
  }
}

// Compute totals per payment method for a given checkout
export async function getCheckoutTotalsAction(id: string) {
  try {
    // Fetch transactions linked to the checkout
    const txs = await prisma.transaction.findMany({
      where: { checkoutId: id, deletedAt: null },
      select: { paymentMethod: true, amount: true },
    });

    const paymentMethodToKey = (pm: string | null | undefined) => {
      if (!pm) return 'other';
      return String(pm)
        .toLowerCase()
        .split(/_|\s+/)
        .map((part, idx) => (idx === 0 ? part : part[0].toUpperCase() + part.slice(1)))
        .join('');
    };

    const totals: Record<string, number> = {};
    let grandTotal = 0;
    for (const t of txs) {
      const key = paymentMethodToKey(String(t.paymentMethod));
      const amount = Number(t.amount ?? 0);
      totals[key] = (totals[key] || 0) + amount;
      grandTotal += amount;
    }

    return { totals, grandTotal };
  } catch (error) {
    console.error('Error computing checkout totals:', error);
    return { totals: {}, grandTotal: 0 };
  }
}
