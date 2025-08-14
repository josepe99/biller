import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DollarSign, X } from 'lucide-react';
import React from 'react';
import { CustomerInfo } from './CustomerInfo';

interface BillingSummaryProps {
  displayData: any;
  cart: any[];
  iva5PercentAmount: number;
  iva10PercentAmount: number;
  total: number;
  customerRuc: string;
  customerInfo: any;
  handleCustomerRucChange: (ruc: string) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isCancelModalOpen: boolean;
  setIsCancelModalOpen: (open: boolean) => void;
  handleConfirmPayment: () => void;
  handleConfirmCancel: () => void;
  currentInvoiceNumber: string;
  formatParaguayanCurrency: (n: number) => string;
}

export function BillingSummary({
  displayData,
  cart,
  iva5PercentAmount,
  iva10PercentAmount,
  total,
  customerRuc,
  customerInfo,
  handleCustomerRucChange,
  isPaymentModalOpen,
  setIsPaymentModalOpen,
  isCancelModalOpen,
  setIsCancelModalOpen,
  handleConfirmPayment,
  handleConfirmCancel,
  currentInvoiceNumber,
  formatParaguayanCurrency,
}: BillingSummaryProps) {
  return (
    <div className="flex-grow flex flex-col justify-between">
      <div className="space-y-2 text-lg">
        {displayData.isCurrentSale && (
          <CustomerInfo customerRuc={customerRuc} customerInfo={customerInfo} handleCustomerRucChange={handleCustomerRucChange} />
        )}
        {displayData.isCurrentSale ? (
          <>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">{formatParaguayanCurrency(cart.reduce((sum, item) => sum + item.lineTotalWithIVA, 0))}</span>
            </div>
            <div className="flex justify-between">
              <span>Descuento:</span>
              <span className="font-medium">Gs 0</span>
            </div>
            <div className="flex justify-between">
              <span>IVA 5%:</span>
              <span className="font-medium">{formatParaguayanCurrency(iva5PercentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA 10%:</span>
              <span className="font-medium">{formatParaguayanCurrency(iva10PercentAmount)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-center text-muted-foreground mb-4">
              <p>Factura procesada</p>
              <p className="text-sm">{displayData.date && new Date(displayData.date).toLocaleString('es-PY')}</p>
            </div>
            {displayData.customerRuc && (
              <div className="mb-4 p-3 border rounded-lg bg-blue-50">
                <h4 className="text-sm font-medium text-blue-700 mb-1">Cliente</h4>
                <p className="text-sm font-medium">{displayData.customerName}</p>
                <p className="text-xs text-blue-600">RUC: {displayData.customerRuc}</p>
              </div>
            )}
          </>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between text-2xl font-bold text-orange-500 pt-2">
          <span>Total:</span>
          <span>{formatParaguayanCurrency(displayData.total)}</span>
        </div>
      </div>
      {displayData.isCurrentSale && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
            <DialogTrigger asChild>
              <Button className="col-span-2 bg-orange-500 hover:bg-orange-600 text-lg py-6" disabled={cart.length === 0}>
                <DollarSign className="mr-2 h-5 w-5" /> Pagar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Pago</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas procesar el pago por un total de <b>{formatParaguayanCurrency(total)}</b>?
                  <br />
                  <strong>Factura: {currentInvoiceNumber}</strong>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleConfirmPayment} className="bg-orange-500 hover:bg-orange-600">Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover:bg-red-50 hover:text-red-600">
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Cancelación</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas cancelar la venta actual? Se perderán todos los artículos en el carrito.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>No</Button>
                <Button onClick={handleConfirmCancel} className="bg-red-500 hover:bg-red-600">Sí, Cancelar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
