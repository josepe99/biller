import { Input } from '@/components/ui/input';
import React from 'react';

interface CustomerInfoProps {
  customerRuc: string;
  customerInfo: any;
  handleCustomerRucChange: (ruc: string) => void;
}

export function CustomerInfo({ customerRuc, customerInfo, handleCustomerRucChange }: CustomerInfoProps) {
  return (
    <div className="mb-4 p-3 border rounded-lg bg-gray-50">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Información del Cliente</h4>
      <div className="space-y-2">
        <div>
          <label className="text-xs text-gray-600">RUC del Cliente (opcional)</label>
          <Input placeholder="Ej: 80012345-1" value={customerRuc} onChange={e => handleCustomerRucChange(e.target.value)} className="text-sm" />
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
