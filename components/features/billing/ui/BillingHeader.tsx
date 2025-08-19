import { ArrowLeft, ArrowRight, History, Receipt, User } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import React from 'react';

interface BillingHeaderProps {
  invoiceHistory: any[];
  currentHistoryIndex: number;
  showPreviousInvoice: () => void;
  showNextInvoice: () => void;
  setCurrentHistoryIndex: (idx: number) => void;
  setIsHistoryModalOpen: (open: boolean) => void;
  displayData: any;
}

export function BillingHeader({
  invoiceHistory,
  currentHistoryIndex,
  showPreviousInvoice,
  showNextInvoice,
  setCurrentHistoryIndex,
  setIsHistoryModalOpen,
  displayData,
}: BillingHeaderProps) {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-orange-500">Facturación</CardTitle>
        <div className="flex items-center gap-4">
          {invoiceHistory.length > 0 && currentHistoryIndex < invoiceHistory.length - 1 && (
            <Button variant="outline" size="sm" onClick={showPreviousInvoice} className="text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4 mr-1" />Anterior
            </Button>
          )}
          {invoiceHistory.length > 0 && currentHistoryIndex !== -1 && (
            <Button variant="outline" size="sm" onClick={() => setCurrentHistoryIndex(-1)} className="text-green-600 hover:text-green-700">
              Actual
            </Button>
          )}
          {invoiceHistory.length > 0 && currentHistoryIndex > 0 && (
            <Button variant="outline" size="sm" onClick={showNextInvoice} className="text-blue-600 hover:text-blue-700">
              Siguiente <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsHistoryModalOpen(true)} className="text-gray-600 hover:text-gray-700">
            <History className="h-4 w-4 mr-1" />Historial
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Receipt className="h-4 w-4" />
            <span>Factura: {displayData.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Cajero: {displayData.cashier}</span>
          </div>
          {!displayData.isCurrentSale && displayData.date && (
            <div className="flex items-center gap-1">
              <span>Fecha: {new Date(displayData.date).toLocaleDateString('es-PY')}</span>
            </div>
          )}
        </div>
        {!displayData.isCurrentSale && (
          <Badge variant="secondary" className="w-fit">Visualizando factura anterior</Badge>
        )}
      </div>
    </CardHeader>
  );
}
