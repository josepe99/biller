import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import React from 'react';

interface BillingTableProps {
  items: any[];
  isCurrentSale: boolean;
  lastAddedProductId: string | null;
  handleQuantityChange: (id: string, newQuantity: number) => void;
  handleRemoveItem: (id: string) => void;
}

export function BillingTable({ items, isCurrentSale, lastAddedProductId, handleQuantityChange, handleRemoveItem }: BillingTableProps) {
  return (
    <div className="flex-grow overflow-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Código</TableHead>
            <TableHead>Artículo</TableHead>
            <TableHead className="w-[120px] text-right">Importe</TableHead>
            <TableHead className="w-[100px] text-center">IVA</TableHead>
            <TableHead className="w-[120px] text-center">Cantidad</TableHead>
            {isCurrentSale && <TableHead className="w-[60px] text-center">Acción</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isCurrentSale ? 6 : 5} className="text-center text-muted-foreground py-8">
                {isCurrentSale ? 'No hay artículos en el carrito.' : 'No hay artículos en esta factura.'}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item: any) => (
              <TableRow key={item.id} className={lastAddedProductId === item.id ? 'bg-orange-50 transition-colors duration-500' : ''}>
                <TableCell className="font-mono text-sm">{item.id || item.code || 'N/A'}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">{item.unitPriceWithIVA || item.unitPrice || 0}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.ivaType === 'IVA 10%' ? 'default' : 'secondary'} className="text-xs">
                    {item.ivaType === 'IVA 10%' ? '10' : item.ivaType === 'IVA 5%' ? '5' : '10'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {isCurrentSale ? (
                    <Input type="number" value={isNaN(item.quantity) ? '' : item.quantity} onChange={e => handleQuantityChange(item.id, isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))} className="w-20 text-center" min="0" />
                  ) : (
                    <span className="font-medium">{item.quantity}</span>
                  )}
                </TableCell>
                {isCurrentSale && (
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
