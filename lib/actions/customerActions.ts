import { CustomerController } from '../controllers/customer.controller';
import { CustomerDataSource } from '../datasources/customer.datasource';

const customerDatasource = new CustomerDataSource();
const customerController = new CustomerController(customerDatasource);

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
