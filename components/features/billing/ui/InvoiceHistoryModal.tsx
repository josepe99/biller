import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState } from 'react';

import { getSalesHistoryAction, searchSalesAction } from '@/lib/actions/saleActions';

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
  searchType,
  setSearchType,
  historySearchTerm,
  setFilteredHistory,
  handleHistorySearch,
  setCurrentHistoryIndex,
}: InvoiceHistoryModalProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        let data = [];
        if (historySearchTerm && historySearchTerm.trim().length > 0) {
          data = await searchSalesAction(historySearchTerm, 50);
        } else {
          data = await getSalesHistoryAction(50, 0);
        }
        if (!ignore) setInvoices(data);
      } catch (e) {
        if (!ignore) setInvoices([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchInvoices();
    return () => { ignore = true; };
  }, [historySearchTerm, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Facturas</DialogTitle>
          <DialogDescription>Buscar y revisar facturas procesadas</DialogDescription>
        </DialogHeader>
        {/* ...rest of the component rendering invoices... */}
      </DialogContent>
    </Dialog>
  );
}
