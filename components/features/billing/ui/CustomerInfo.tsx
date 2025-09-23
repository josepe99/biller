import CustomerForm from '@/components/features/admin/customer-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

interface CustomerInfoProps {
  customerRuc: string;
  customerInfo: any;
  handleCustomerRucChange: (ruc: string) => void;
}

export function CustomerInfo({ customerRuc, customerInfo, handleCustomerRucChange }: CustomerInfoProps) {
  return (
    <div className="mb-4 p-3">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Cliente</h4>
      <div className="space-y-2">
        <div>
          <label className="text-xs text-gray-600">RUC del Cliente (opcional)</label>
          <div className="mt-1 flex items-center gap-2">
            <Input
              placeholder="Ej: 80012345-1"
              value={customerRuc}
              onChange={e => handleCustomerRucChange(e.target.value)}
              className="text-sm flex-1"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" className="h-9 w-9 flex items-center justify-center">+</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Cliente</DialogTitle>
                </DialogHeader>
                <CustomerForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {customerInfo && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            <p className="font-medium">{customerInfo.name}</p>
            <p>RUC: {customerInfo.ruc}</p>
            {customerInfo.phone && <p>Tel: {customerInfo.phone}</p>}
          </div>
        )}
        {customerRuc && !customerInfo && customerRuc.length >= 8 && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            Cliente no encontrado. La factura se emitirá sin datos del cliente.
          </div>
        )}
      </div>
    </div>
  );
}
