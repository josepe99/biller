import { User, UserCircle, FileText, StickyNote } from 'lucide-react';

interface SaleDetailsProps {
  cashierName?: string | null;
  customerName?: string | null;
  customerRuc?: string | null;
  notes?: string | null;
}

export function SaleDetails({ cashierName, customerName, customerRuc, notes }: SaleDetailsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-gray-400" />
        <span className="font-semibold">Cajero:</span>
        <span>{cashierName || '-'}</span>
      </div>
      <div className="flex items-center gap-2">
        <UserCircle className="h-5 w-5 text-gray-400" />
        <span className="font-semibold">Cliente:</span>
        <span>{customerName || '-'}</span>
      </div>
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-gray-400" />
        <span className="font-semibold">RUC Cliente:</span>
        <span>{customerRuc || '-'}</span>
      </div>
      <div className="flex items-center gap-2">
        <StickyNote className="h-5 w-5 text-gray-400" />
        <span className="font-semibold">Notas:</span>
        <span>{notes || '-'}</span>
      </div>
    </div>
  );
}