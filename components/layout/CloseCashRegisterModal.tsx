import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { formatNumberWithDots } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

interface CloseCashRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // finalAmounts: map of payment method keys (camelCase) to final numeric amounts
  onSubmit: (data: { finalAmounts: Record<string, number>; closingNotes?: string }) => void;
  loading: boolean;
}

export default function CloseCashRegisterModal({ open, onOpenChange, onSubmit, loading }: CloseCashRegisterModalProps) {
  // store numeric values per payment method (as strings for controlled inputs)
  const paymentMethods = [
    { key: 'cash', label: 'Efectivo' },
    { key: 'debitCard', label: 'Tarjeta débito' },
    { key: 'creditCard', label: 'Tarjeta crédito' },
    { key: 'tigoMoney', label: 'Tigo Money' },
    { key: 'personalPay', label: 'Personal Pay' },
    { key: 'bankTransfer', label: 'Transferencia bancaria' },
    { key: 'qrPayment', label: 'Pago QR' },
    { key: 'crypto', label: 'Cripto' },
    { key: 'cheque', label: 'Cheque' },
    { key: 'other', label: 'Otro' },
  ];

  const initialAmounts: Record<string, string> = {};
  paymentMethods.forEach(m => (initialAmounts[m.key] = ''));

  const [finalAmounts, setFinalAmounts] = useState<Record<string, string>>(initialAmounts);
  const [closingNotes, setClosingNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [editingKey, setEditingKey] = useState<string | null>(null);

  const formatNumber = (value?: number | null) => {
    if (value == null || Number.isNaN(value)) return '';
    return formatNumberWithDots(value);
  };

  const parseInputToNumber = (str: string) => {
    if (!str) return 0;
    // Remove dots used as thousand separators and spaces; allow comma as decimal
    const normalized = str.replace(/\./g, '').replace(/\s/g, '').replace(',', '.');
    const n = Number(normalized);
    return Number.isNaN(n) ? 0 : n;
  };

  const handleSubmit = () => {
    setError(null);
    // parse amounts
    const parsed: Record<string, number> = {};
    let anyPositive = false;
    for (const key of Object.keys(finalAmounts)) {
      const n = parseInputToNumber(finalAmounts[key]);
      parsed[key] = n;
      if (n > 0) anyPositive = true;
    }
    if (!anyPositive) {
      setError('Ingrese al menos un monto mayor que 0.');
      return;
    }

    onSubmit({ finalAmounts: parsed, closingNotes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar Caja</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Montos finales por método</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {paymentMethods.map(m => {
                const raw = finalAmounts[m.key] ?? '';
                const display = formatNumberWithDots(raw);
                return (
                  <div key={m.key}>
                    <label className="block text-xs text-gray-600 mb-1">{m.label}</label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={display}
                      onChange={e => {
                        let value = e.target.value.replace(/\D/g, '');
                        value = value.replace(/^0+(?!$)/, '');
                        setFinalAmounts(prev => ({ ...prev, [m.key]: value }));
                      }}
                      onPaste={e => {
                        e.preventDefault();
                        let paste = e.clipboardData.getData('Text').replace(/\D/g, '');
                        paste = paste.replace(/^0+(?!$)/, '');
                        setFinalAmounts(prev => ({ ...prev, [m.key]: paste }));
                      }}
                      placeholder="Ej: 10.000"
                      disabled={loading}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Notas de cierre (opcional)</label>
            <Input
              value={closingNotes}
              onChange={e => setClosingNotes(e.target.value)}
              placeholder="Observaciones..."
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-red-500 hover:bg-red-600" disabled={loading}>
            {loading ? 'Cerrando...' : 'Cerrar Caja'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
