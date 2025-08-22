"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CustomerForm from '@/components/features/admin/customer-form';
import { Customer } from '@prisma/client';

export default function CustomerEditDialog({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Editar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        <CustomerForm initialData={customer} mode="edit" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
