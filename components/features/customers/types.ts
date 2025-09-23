import { Customer } from "@prisma/client";

export interface CustomerListItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  ruc?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export function mapCustomerToListItem(customer: Customer): CustomerListItem {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    ruc: customer.ruc,
    createdAt: customer.createdAt ?? undefined,
    updatedAt: customer.updatedAt ?? undefined,
    deletedAt: customer.deletedAt ?? undefined,
  };
}
