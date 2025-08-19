import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CloseCashRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { finalCash: number; closingNotes?: string }) => void;
  loading: boolean;
}

export default function CloseCashRegisterModal({ open, onOpenChange, onSubmit, loading }: CloseCashRegisterModalProps) {
  const [finalCash, setFinalCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    if (!finalCash || isNaN(Number(finalCash))) {
      setError('Ingrese un monto válido.');
      return;
    }
    onSubmit({ finalCash: Number(finalCash), closingNotes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar Caja</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Efectivo final en caja</label>
            <Input
              type="number"
              value={finalCash}
              onChange={e => setFinalCash(e.target.value)}
              min={0}
              placeholder="Ej: 100000"
              disabled={loading}
            />
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
          <Button onClick={handleSubmit} className="bg-red-500 hover:bg-red-600" disabled={loading || !finalCash}>
            {loading ? 'Cerrando...' : 'Cerrar Caja'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
