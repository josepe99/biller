"use server"

import { CheckoutController } from '@/lib/controllers/checkout.controller';

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
