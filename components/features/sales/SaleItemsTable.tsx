interface SaleItem {
  id: string;
  product?: {
    name?: string;
  } | null;
  quantity: number;
  unitPrice?: number | null;
  total?: number | null;
}

interface SaleItemsTableProps {
  items?: SaleItem[];
}

export function SaleItemsTable({ items = [] }: SaleItemsTableProps) {
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return amount.toLocaleString('es-PY', { 
      style: 'currency', 
      currency: 'PYG', 
      minimumFractionDigits: 0 
    });
  };

  return (
    <div className="mt-8">
      <div className="font-semibold text-lg mb-2 text-gray-700">Items</div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Producto</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-600">Cantidad</th>
              <th className="px-4 py-2 text-right font-semibold text-gray-600">Precio Unitario</th>
              <th className="px-4 py-2 text-right font-semibold text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t hover:bg-orange-50">
                <td className="px-4 py-2">{item.product?.name || '-'}</td>
                <td className="px-4 py-2 text-center">{item.quantity}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}