"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { amount: number; description?: string }) => Promise<void> | void;
  loading?: boolean;
}

export default function WithdrawModal({ open, onOpenChange, onSubmit, loading = false }: WithdrawModalProps) {
  const [amountRaw, setAmountRaw] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatNumberWithDots = (val: string) => {
    if (!val) return '';
    return val.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountRaw(raw);
    setDisplayAmount(formatNumberWithDots(raw));
  }

  const handleSubmit = async () => {
    setError(null);
    if (!amountRaw || isNaN(Number(amountRaw)) || Number(amountRaw) <= 0) {
      setError('Ingrese un monto válido.');
      return;
    }
    const data = { amount: Number(amountRaw), description };
    await onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extraer dinero</DialogTitle>
          <DialogDescription>Ingrese el monto y una descripción opcional para registrar la extracción.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Monto (Gs)</label>
            <Input
              type="text"
              inputMode="numeric"
              value={displayAmount}
              onChange={handleAmountChange}
              placeholder="Ej: 50.000"
              disabled={loading}
              maxLength={12}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Descripción (opcional)</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Motivo de la extracción..."
              disabled={loading}
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600" disabled={loading || !amountRaw}>
            {loading ? 'Procesando...' : 'Extraer dinero'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
