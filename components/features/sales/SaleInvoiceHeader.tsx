import { Receipt, Calendar } from 'lucide-react';

interface SaleInvoiceHeaderProps {
  saleNumber: string;
  createdAt: Date | null;
}

export function SaleInvoiceHeader({ saleNumber, createdAt }: SaleInvoiceHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-4 mb-4">
      <div className="flex items-center gap-2 mb-2 md:mb-0">
        <Receipt className="text-orange-500 h-6 w-6" />
        <span className="text-2xl font-bold text-orange-500">Factura #{saleNumber}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-500">
        <Calendar className="h-5 w-5" />
        <span>{createdAt ? new Date(createdAt).toLocaleString() : '-'}</span>
      </div>
    </div>
  );
}