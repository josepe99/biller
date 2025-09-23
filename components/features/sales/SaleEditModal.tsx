"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit3, Save, X, AlertTriangle } from "lucide-react";
import { useSalePermissions } from "@/components/auth/sale-detail-wrapper";
import { toast } from "@/hooks/use-toast";
import { updateSaleAction } from "@/lib/actions/saleActions";

interface SaleEditModalProps {
  saleId: string;
  saleNumber: string;
  currentStatus: string;
  currentNotes?: string | null;
  onUpdate?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'COMPLETED', label: 'Completada', description: 'Venta completada exitosamente' },
  { value: 'CANCELLED', label: 'Cancelada', description: 'Venta cancelada' },
] as const;

const STATUS_COLORS = {
  COMPLETED: 'text-green-600',
  PENDING: 'text-yellow-600',
  CANCELLED: 'text-red-600',
  REFUNDED: 'text-orange-600',
} as const;

export function SaleEditModal({ saleId, saleNumber, currentStatus, currentNotes, onUpdate }: SaleEditModalProps) {
  const { canUpdate } = useSalePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes || '');

  if (!canUpdate) {
    return null;
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData: { status?: string; notes?: string } = {};
      
      if (status !== currentStatus) {
        updateData.status = status;
      }
      
      if (notes !== (currentNotes || '')) {
        updateData.notes = notes;
      }

      await updateSaleAction(saleId, updateData);
      
      toast({
        title: "Factura actualizada",
        description: `La factura ${saleNumber} ha sido actualizada exitosamente.`,
      });
      
      setIsOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating sale:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la factura. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = status !== currentStatus || notes !== (currentNotes || '');
  const isStatusChangeValid = status === 'CANCELLED' || status === currentStatus;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit3 className="h-4 w-4" />
          Editar Factura
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Editar Factura #{saleNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status Display */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Estado Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={currentStatus === 'COMPLETED' ? 'default' : 
                       currentStatus === 'CANCELLED' ? 'destructive' : 'secondary'}
                className="text-sm"
              >
                {currentStatus === 'COMPLETED' ? 'Completada' :
                 currentStatus === 'CANCELLED' ? 'Cancelada' :
                 currentStatus === 'PENDING' ? 'Pendiente' :
                 currentStatus === 'REFUNDED' ? 'Reembolsada' : currentStatus}
              </Badge>
            </CardContent>
          </Card>

          {/* Status Change */}
          {currentStatus !== 'CANCELLED' && (
            <div className="space-y-2">
              <Label htmlFor="status">Cambiar Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentStatus}>
                    Mantener estado actual ({currentStatus === 'COMPLETED' ? 'Completada' : 'Pendiente'})
                  </SelectItem>
                  {currentStatus === 'COMPLETED' && (
                    <SelectItem value="CANCELLED">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <div>
                          <div className="font-medium">Cancelar</div>
                          <div className="text-xs text-muted-foreground">Anular esta factura</div>
                        </div>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {status === 'CANCELLED' && currentStatus !== 'CANCELLED' && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <div className="font-medium">⚠️ Atención</div>
                  <div>Esta acción cancelará la factura. Una vez cancelada, no se puede deshacer.</div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas sobre esta factura..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isLoading || !isStatusChangeValid}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}