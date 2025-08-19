"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { formatNumberWithDots } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { getAllCheckouts } from "@/lib/actions/checkoutActions";

interface OpenCashRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { initialCash: number; openingNotes?: string; checkoutId: string }) => Promise<void>;
  loading: boolean;
}

export default function OpenCashRegisterModal({ open, onOpenChange, onSubmit, loading }: OpenCashRegisterModalProps) {
  const [initialCash, setInitialCash] = useState('');
  const [displayCash, setDisplayCash] = useState('');
  const [openingNotes, setOpeningNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Estado para guardar los checkouts
  const [checkouts, setCheckouts] = useState<any[]>([]);
  // Estado para el checkout seleccionado
  const [checkoutId, setCheckoutId] = useState<string>("");


  useEffect(() => {
    const fetchCheckouts = async () => {
      const data = await getAllCheckouts();
      setCheckouts(data);
    };
    fetchCheckouts();
  }, []);


  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setInitialCash(raw);
    setDisplayCash(formatNumberWithDots(raw));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!checkoutId) {
      setError('Seleccione una caja.');
      return;
    }
    if (!initialCash || isNaN(Number(initialCash)) || Number(initialCash) < 0) {
      setError('Ingrese un monto inicial válido.');
      return;
    }
    await onSubmit({ initialCash: Number(initialCash), openingNotes, checkoutId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir Caja</DialogTitle>
          <DialogDescription>Complete los datos para abrir la caja</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Select para elegir checkout */}
          <div>
            <label className="block text-sm mb-1">Seleccionar caja</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading || checkouts.length === 0}
              value={checkoutId}
              onChange={e => setCheckoutId(e.target.value)}
            >
              <option value="">Selecciona tu caja</option>
              {checkouts && checkouts.length > 0 && checkouts.map((checkout: any) => (
                <option key={checkout.id} value={checkout.id}>
                  {checkout.name || checkout.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Monto inicial (Gs)</label>
            <Input
              type="text"
              inputMode="numeric"
              value={displayCash}
              onChange={handleCashChange}
              min={0}
              placeholder="Ej: 100.000"
              disabled={loading}
              autoComplete="off"
              maxLength={12}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Notas de apertura (opcional)</label>
            <Input
              value={openingNotes}
              onChange={e => setOpeningNotes(e.target.value)}
              placeholder="Observaciones..."
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600" disabled={loading || !initialCash || !checkoutId}>
            {loading ? 'Abriendo...' : 'Abrir Caja'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
