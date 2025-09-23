import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, DollarSign, Printer } from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'DEBIT_CARD', label: 'Débito' },
  { value: 'CREDIT_CARD', label: 'Crédito' },
  { value: 'TIGO_MONEY', label: 'Tigo Money' },
  { value: 'PERSONAL_PAY', label: 'Personal Pay' },
  { value: 'BANK_TRANSFER', label: 'Transferencia' },
  { value: 'QR_PAYMENT', label: 'QR' },
  { value: 'CRYPTO', label: 'Cripto' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Otro' },
];

interface Payment {
  method: string;
  amount: number;
}

interface PaymentMethodsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  total: number;
  currentInvoiceNumber: string;
  formatParaguayanCurrency: (n: number) => string;
  onConfirm: (payments: Payment[], shouldPrint?: boolean) => void;
  cartIsEmpty?: boolean;
  checkoutClosed?: boolean;
  cashRegisterOpen?: boolean;
  customer?: {
    name?: string;
    ruc?: string;
  };
}

export function PaymentMethodsDialog({
  open,
  setOpen,
  total,
  currentInvoiceNumber,
  formatParaguayanCurrency,
  onConfirm,
  cartIsEmpty,
  checkoutClosed,
  cashRegisterOpen,
  customer,
}: PaymentMethodsDialogProps) {
  const [payments, setPayments] = useState<Payment[]>([
    { method: 'CASH', amount: total }
  ]);

  React.useEffect(() => {
    // Reset payments when dialog opens
    if (open) setPayments([{ method: 'CASH', amount: total }]);
  }, [open, total]);

  const addPayment = () => setPayments([...payments, { method: 'CASH', amount: 0 }]);
  const removePayment = (idx: number) => setPayments(payments.filter((_, i) => i !== idx));
  // Helper to parse Paraguayan formatted numbers (e.g. 50.000)
  function parseParaguayanNumber(str: string): number {
    // Remove dots (thousand separators), replace comma with dot (decimal)
    return Number(str.replace(/\./g, '').replace(',', '.')) || 0;
  }
  // Update payment method or amount
  const updatePayment = (idx: number, field: 'method' | 'amount', value: any) => {
    setPayments(payments.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  // Change is only given if totalPaid > total and at least one payment is cash
  const hasCash = payments.some(p => p.method === 'CASH');
  const change = hasCash && totalPaid > total ? totalPaid - total : 0;
  const isCashRegisterOpen = cashRegisterOpen ?? true;
  const canConfirm = totalPaid >= total && payments.every(p => p.amount && p.amount > 0);

  const handleConfirm = (shouldPrint: boolean = false) => {
    onConfirm(payments, shouldPrint);
    setPayments([{ method: 'CASH', amount: total }]); // Reset form
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="col-span-2 bg-orange-500 hover:bg-orange-600 text-lg py-6" disabled={!!cartIsEmpty || !!checkoutClosed || !isCashRegisterOpen}>
          <DollarSign className="mr-2 h-5 w-5" /> Pagar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Pago</DialogTitle>
          <DialogDescription>
            Selecciona los métodos de pago y los montos.<br />
            <strong>Factura: {currentInvoiceNumber}</strong><br />
            <span>
              Cliente: <b>{customer?.name ? customer.name : 'Sin Cliente'}</b> &nbsp;|&nbsp; RUC: <b>{customer?.ruc ? customer.ruc : 'Sin RUC'}</b>
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {payments.map((p, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select
                className="border rounded px-2 py-1"
                value={p.method}
                onChange={e => updatePayment(idx, 'method', e.target.value)}
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <Input
                type="text"
                inputMode="numeric"
                min={0}
                value={
                  // Remove 'Gs' or any non-digit, non-dot, non-comma prefix from formatted value
                  formatParaguayanCurrency(Number.isNaN(p.amount) ? 0 : p.amount).replace(/^\D+/, '')
                }
                onChange={e => {
                  // Remove all non-digit, non-dot, non-comma chars
                  const raw = e.target.value.replace(/[^\d.,]/g, '');
                  updatePayment(idx, 'amount', parseParaguayanNumber(raw));
                }}
                onBlur={e => {
                  // Format on blur
                  const val = parseParaguayanNumber(e.target.value);
                  updatePayment(idx, 'amount', val);
                }}
                className="w-28"
                placeholder="Monto"
              />
              {payments.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removePayment(idx)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addPayment} className="mt-2">Agregar método</Button>
          <div className="mt-2 text-sm">
            <div>Total a pagar: <b>{formatParaguayanCurrency(total)}</b></div>
            <div>Total ingresado: <b>{formatParaguayanCurrency(totalPaid)}</b></div>
            {change > 0 && hasCash && (
              <div className="text-green-600">Cambio: <b>{formatParaguayanCurrency(change)}</b></div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => handleConfirm(false)}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={!canConfirm}
          >
            Confirmar Pago
          </Button>
          <Button
            onClick={() => handleConfirm(true)}
            className="bg-blue-500 hover:bg-blue-600"
            disabled={!canConfirm}
          >
            <Printer className="mr-2 h-4 w-4" />
            Confirmar e Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
