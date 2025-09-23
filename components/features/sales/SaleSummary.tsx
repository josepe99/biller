import { BadgeDollarSign } from 'lucide-react';

interface SaleSummaryProps {
  subtotal?: number | null;
  tax?: number | null;
  total?: number | null;
  status?: string;
}

export function SaleSummary({ subtotal, tax, total, status }: SaleSummaryProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return amount.toLocaleString('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 font-semibold';
      case 'CANCELLED':
        return 'text-red-600 font-semibold';
      case 'REFUNDED':
        return 'text-orange-600 font-semibold';
      case 'PENDING':
        return 'text-yellow-600 font-semibold';
      default:
        return 'text-gray-600 font-semibold';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'REFUNDED':
        return 'Reembolsada';
      case 'PENDING':
        return 'Pendiente';
      default:
        return status || '-';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Subtotal:</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">IVA:</span>
        <span>{formatCurrency(tax)}</span>
      </div>
      <div className="flex items-center gap-2 text-2xl font-bold text-orange-500">
        <BadgeDollarSign className="h-6 w-6" />
        <span>Total:</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold">Estado:</span>
        <span className={getStatusColor(status)}>{getStatusLabel(status)}</span>
      </div>
    </div>
  );
}