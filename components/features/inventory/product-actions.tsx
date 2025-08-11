'use client'

import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Product } from '@/lib/types'

interface ProductActionsProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (barcode: number) => void
}

export function ProductActions({ product, onEdit, onDelete }: ProductActionsProps) {
  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(product)}
      >
        <Edit className="h-4 w-4 text-blue-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(product.barcode)}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}
