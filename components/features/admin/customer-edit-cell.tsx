"use client";

import { Customer } from '@prisma/client';
import CustomerEditDialog from '@/components/features/admin/customer-edit-dialog';

export default function CustomerEditCell({ customer }: { customer: Customer }) {
  return <CustomerEditDialog customer={customer} />;
}
