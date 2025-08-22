"use server"

import { customerController } from '../controllers/customer.controller';

export async function getAllCustomers() {
  return await customerController.getAll();
}

export async function getCustomerById(id: string) {
  return await customerController.getById(id);
}

export async function createCustomer(data: any) {
  return await customerController.create(data);
}

export async function updateCustomer(id: string, data: any) {
  return await customerController.update(id, data);
}

export async function deleteCustomer(id: string) {
  return await customerController.delete(id);
}

export async function findCustomerByRuc(ruc: string) {
  return await customerController.findByRuc(ruc);
}

export async function searchCustomers(query: string) {
  return await customerController.search(query);
}
