import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { getSalesHistoryAction, searchSalesAction } from '@/lib/actions/saleActions';
import { useAuth } from '@/hooks';

interface InvoiceHistoryModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  searchType: 'invoice' | 'ruc';
  setSearchType: (type: 'invoice' | 'ruc') => void;
  historySearchTerm: string;
  setFilteredHistory: (history: any[]) => void;
  handleHistorySearch: () => void;
  setCurrentHistoryIndex: (idx: number) => void;
}

export function InvoiceHistoryModal({
  isOpen,
  setIsOpen,
  historySearchTerm,
}: InvoiceHistoryModalProps) {

  const { user } = useAuth();
  const userId = user?.id;
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // removed useRouter, using Link instead

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        let data: any[] = [];
        if (historySearchTerm && historySearchTerm.trim().length > 0) {
          data = await searchSalesAction(historySearchTerm, 50);
        } else if (userId) {
          data = await getSalesHistoryAction(userId, 50, 0);
        } else {
          data = [];
        }
        console.log(data)
        setInvoices(data);
      } catch (e) {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [historySearchTerm, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Facturas</DialogTitle>
          <DialogDescription>Buscar y revisar facturas procesadas</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No se encontraron facturas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-3 py-2 border">Nro. Factura</th>
                    <th className="px-3 py-2 border">Fecha</th>
                    <th className="px-3 py-2 border">Cliente</th>
                    <th className="px-3 py-2 border">RUC</th>
                    <th className="px-3 py-2 border">Subtotal</th>
                    <th className="px-3 py-2 border">IVA</th>
                    <th className="px-3 py-2 border">Total</th>
                    <th className="px-3 py-2 border">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-accent cursor-pointer">
                      <td className="px-3 py-2 border font-mono">
                        <Link href={`/${inv.saleNumber}`} className="block w-full h-full">
                          {inv.saleNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-2 border">
                        <Link href={`/${inv.saleNumber}`} className="block w-full h-full">
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : '-'}
                        </Link>
                      </td>
                      <td className="px-3 py-2 border">
                        <Link href={`/${inv.saleNumber}`} className="block w-full h-full">
                          {inv.customer?.name || '-'}
                        </Link>
                      </td>
                      <td className="px-3 py-2 border">
                        <Link href={`/${inv.saleNumber}`} className="block w-full h-full">
                          {inv.customer?.ruc || '-'}
                        </Link>
                      </td>
                      <td className="px-3 py-2 border text-right">
                        <Link href={`/${inv.saleNumber}`} className="block w-full h-full">
                          {inv.subtotal?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}
                        </Link>
                      </td>
                      <td className="px-3 py-2 border text-right">
                        <Link href={`/${inv.saleNumber}`} className="block w-full h-full">
                          {inv.tax?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}
                        </Link>
                      </td>
                      <td className="px-3 py-2 border text-right">
                        <Link href={`/${inv.saleNumber}`} className="block w-full h-full">
                          {inv.total?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}
                        </Link>
                      </td>
                      <td className="px-3 py-2 border">
                        <Link href={`/${inv.saleNumber}`} className="block w-full h-full">
                          {inv.status}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
