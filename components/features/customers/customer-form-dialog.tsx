"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomerForm from "@/components/features/admin/customer-form";
import { CustomerListItem } from "@/components/features/customers/types";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  customer?: CustomerListItem | null;
  onSuccess: () => void;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  mode,
  customer,
  onSuccess,
}: CustomerFormDialogProps) {
  const title = mode === "edit" ? "Editar Cliente" : "Agregar Cliente";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <CustomerForm
          initialData={mode === "edit" ? customer : undefined}
          mode={mode}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
