'use client'

import { Product } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ProductActions } from './product-actions'

interface ProductTableProps {
  products: Product[]
  onEditProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
}

export function ProductTable({ 
  products, 
  onEditProduct, 
  onDeleteProduct 
}: ProductTableProps) {
  return (
    <div className="flex-grow overflow-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código de barras</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Precio (con IVA)</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>IVA</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
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
                <TableCell className="font-medium">{product.barcode}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{product.name}</span>
                    {product.discount && (
                      <Badge 
                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 text-xs animate-pulse"
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
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.iva}%</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <ProductActions
                    product={product}
                    onEdit={onEditProduct}
                    onDelete={onDeleteProduct}
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
