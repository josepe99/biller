"use server";

import { CheckoutController } from "@/lib/controllers/checkout.controller";

const controller = new CheckoutController();

// Crear un nuevo checkout
export async function createCheckout(data: any) {
  // Asume que el controller tiene un método create heredado de BaseController
  return await controller.create(data);
}

// Obtener un checkout por ID
export async function getCheckoutById(id: string) {
  return await controller.getCheckoutById(id);
}

// Listar todos los checkouts
export async function getAllCheckouts() {
  return await controller.getAllCheckouts();
}

// Actualizar un checkout
export async function updateCheckout(id: string, data: any) {
  // Asume que el controller tiene un método update heredado de BaseController
  return await controller.update(id, data);
}

// Eliminar un checkout (soft delete)
export async function deleteCheckout(id: string) {
  // Asume que el controller tiene un método delete heredado de BaseController
  return await controller.delete(id);
}
