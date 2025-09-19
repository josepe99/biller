'use client'

import { ProductActions } from './product-actions';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface ProductTableProps {
  products: Product[]
  onEditProduct?: (product: Product) => void
  onDeleteProduct?: (productId: string) => void
  canUpdate?: boolean
  canDelete?: boolean
}

export function ProductTable({
  products,
  onEditProduct,
  onDeleteProduct,
  canUpdate,
  canDelete
}: ProductTableProps) {
  return (
    <div className="flex-grow overflow-auto border rounded-lg h-[calc(100vh-280px)]">
      <Table className="min-w-full table-auto">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Código de barras</TableHead>
            <TableHead className="max-w-[200px]">Nombre</TableHead>
            <TableHead className="text-right whitespace-nowrap">Precio (con IVA)</TableHead>
            <TableHead className="text-center whitespace-nowrap">Stock / Unidad</TableHead>
            <TableHead className="whitespace-nowrap">Categoría</TableHead>
            <TableHead className="whitespace-nowrap">IVA</TableHead>
            <TableHead className="text-center whitespace-nowrap">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No se encontraron productos.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product, index) => (
              <TableRow key={`product-${product.id}-${product.barcode}-${index}`}>
                <TableCell className="font-medium whitespace-nowrap">{product.barcode}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate max-w-[150px]" title={product.name}>{product.name}</span>
                    {(typeof product.discount === 'number' && product.discount > 0) && (
                      <Badge
                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 text-xs animate-pulse flex-shrink-0"
                      >
                        {product.discount}%
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">Gs {product.price.toFixed(0)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={product.stock <= 5 ? 'destructive' : 'secondary'}>
                    {product.stock}
                  </Badge>
                  <span className="ml-1 text-xs text-muted-foreground">{product.unity}</span>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.iva}%</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <ProductActions
                    product={product}
                    onEdit={canUpdate ? onEditProduct : undefined}
                    onDelete={canDelete ? onDeleteProduct : undefined}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
