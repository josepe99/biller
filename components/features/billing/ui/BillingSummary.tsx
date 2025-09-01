import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import React from 'react';
import { CustomerInfo } from './CustomerInfo';
import { PaymentMethodsDialog } from './PaymentMethodsDialog';

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
  handleConfirmPayment: (payments: { method: string; amount: number }[]) => void;
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
          <PaymentMethodsDialog
            open={isPaymentModalOpen}
            setOpen={setIsPaymentModalOpen}
            total={total}
            currentInvoiceNumber={currentInvoiceNumber}
            formatParaguayanCurrency={formatParaguayanCurrency}
            onConfirm={handleConfirmPayment}
            cartIsEmpty={cart.length === 0}
            customer={customerInfo}
            checkoutClosed={typeof displayData.checkoutClosed !== 'undefined' ? displayData.checkoutClosed : false}
          />
        </div>
      )}
    </div>
  );
}
