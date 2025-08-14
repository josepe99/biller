import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { formatNumberWithDots } from '@/lib/utils';

interface OpenCashRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { initialCash: number; openingNotes?: string }) => Promise<void>;
  loading: boolean;
}

export default function OpenCashRegisterModal({ open, onOpenChange, onSubmit, loading }: OpenCashRegisterModalProps) {
  const [initialCash, setInitialCash] = useState('');
  // Para mostrar el valor formateado
  const [displayCash, setDisplayCash] = useState('');
  const [openingNotes, setOpeningNotes] = useState('');
  const [error, setError] = useState<string | null>(null);


  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setInitialCash(raw);
    setDisplayCash(formatNumberWithDots(raw));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!initialCash || isNaN(Number(initialCash)) || Number(initialCash) < 0) {
      setError('Ingrese un monto inicial válido.');
      return;
    }
    await onSubmit({ initialCash: Number(initialCash), openingNotes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir Caja</DialogTitle>
          <DialogDescription>Complete los datos para abrir la caja</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
          <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600" disabled={loading || !initialCash}>
            {loading ? 'Abriendo...' : 'Abrir Caja'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
