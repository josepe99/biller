import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search } from 'lucide-react';
import React from 'react';

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  searchType: 'invoice' | 'ruc';
  setSearchType: (type: 'invoice' | 'ruc') => void;
  historySearchTerm: string;
  setHistorySearchTerm: (term: string) => void;
  invoiceHistory: any[];
  filteredHistory: any[];
  setFilteredHistory: (history: any[]) => void;
  handleHistorySearch: () => void;
  setCurrentHistoryIndex: (idx: number) => void;
}

export function InvoiceHistoryModal({
  isOpen,
  setIsOpen,
  searchType,
  setSearchType,
  historySearchTerm,
  setHistorySearchTerm,
  invoiceHistory,
  filteredHistory,
  setFilteredHistory,
  handleHistorySearch,
  setCurrentHistoryIndex,
}: InvoiceHistoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Facturas</DialogTitle>
          <DialogDescription>Buscar y revisar facturas procesadas</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 border-b pb-4">
          <div className="flex gap-2 items-center">
            <div className="flex gap-1">
              <Button variant={searchType === 'invoice' ? 'default' : 'outline'} size="sm" onClick={() => setSearchType('invoice')} className="text-xs">Por Factura</Button>
              <Button variant={searchType === 'ruc' ? 'default' : 'outline'} size="sm" onClick={() => setSearchType('ruc')} className="text-xs">Por RUC/Cliente</Button>
            </div>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={searchType === 'invoice' ? 'Buscar por número de factura (ej: 001-001-0000001)' : 'Buscar por RUC o nombre del cliente'}
                value={historySearchTerm}
                onChange={e => setHistorySearchTerm(e.target.value)}
                className="text-sm"
              />
              <Button onClick={handleHistorySearch} size="sm" className="bg-orange-500 hover:bg-orange-600">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {historySearchTerm && (
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{filteredHistory.length} de {invoiceHistory.length} facturas{searchType === 'invoice' ? ' por número' : ' por cliente'}</span>
              <Button variant="ghost" size="sm" onClick={() => { setHistorySearchTerm(''); setFilteredHistory(invoiceHistory); }} className="text-xs">Limpiar búsqueda</Button>
            </div>
          )}
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {historySearchTerm ? (
                <div>
                  <p>No se encontraron facturas que coincidan con la búsqueda</p>
                  <p className="text-sm mt-1">"{historySearchTerm}"</p>
                </div>
              ) : (
                <p>No hay facturas en el historial</p>
              )}
            </div>
          ) : (
            filteredHistory.map((invoice, index) => (
              <Card key={invoice.id} className="border hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{invoice.invoiceNumber}</h4>
                        <Badge variant="outline" className="text-xs">{invoice.customerRuc ? 'Con Cliente' : 'Sin Cliente'}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><span className="font-medium">Fecha:</span> {new Date(invoice.date).toLocaleString('es-PY')}</p>
                        <p><span className="font-medium">Cajero:</span> {invoice.cashier}</p>
                        {invoice.customerRuc && (
                          <div className="bg-blue-50 p-2 rounded text-blue-800">
                            <p className="font-medium">{invoice.customerName}</p>
                            <p className="text-xs">RUC: {invoice.customerRuc}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-500 mb-2">Gs {invoice.total.toLocaleString('es-PY')}</p>
                      <Button variant="outline" size="sm" onClick={() => { setCurrentHistoryIndex(invoiceHistory.findIndex(h => h.id === invoice.id)); setIsOpen(false); }} className="text-xs">Ver Detalle</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Artículos ({invoice.items.length})</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{invoice.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} unidades</span>
                    </div>
                    <div className="space-y-1">
                      {invoice.items.slice(0, 2).map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="flex justify-between text-xs">
                          <span>• {item.name} (x{item.quantity})</span>
                          <span>Gs {item.total.toLocaleString('es-PY')}</span>
                        </div>
                      ))}
                      {invoice.items.length > 2 && (
                        <p className="text-xs text-gray-500 italic">... y {invoice.items.length - 2} artículos más</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
