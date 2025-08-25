"use server";

import { CheckoutController } from "@/lib/controllers/checkout.controller";

const checkoutController = new CheckoutController();

// Crear un nuevo checkout
export async function createCheckout(data: any) {
  // Asume que el checkoutController tiene un método create heredado de BaseController
  return await checkoutController.create(data);
}

// Obtener un checkout por ID
export async function getCheckoutById(id: string) {
  return await checkoutController.getCheckoutById(id);
}

// Listar todos los checkouts
export async function getAllCheckouts() {
  return await checkoutController.getAllCheckouts();
}

// Actualizar un checkout
export async function updateCheckout(id: string, data: any) {
  // Asume que el checkoutController tiene un método update heredado de BaseController
  return await checkoutController.update(id, data);
}

// Eliminar un checkout (soft delete)
export async function deleteCheckout(id: string) {
  // Asume que el checkoutController tiene un método delete heredado de BaseController
  return await checkoutController.delete(id);
}

export async function getCheckoutList() {
  return await checkoutController.getList();
}