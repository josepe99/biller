'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Product } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface ProductFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingProduct: Product | null
  onSubmit: (e: React.FormEvent) => void
}

export function ProductForm({
  isOpen,
  onOpenChange,
  editingProduct,
  onSubmit
}: ProductFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {editingProduct 
              ? 'Modifica los detalles del producto.' 
              : 'Ingresa los detalles del nuevo producto.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
          <Input
            name="barcode"
            type="number"
            placeholder="Código de Barras"
            defaultValue={editingProduct?.barcode || ''}
            required
          />
          <Input 
            name="name" 
            placeholder="Nombre del Producto" 
            defaultValue={editingProduct?.name || ''} 
            required 
          />
          <Input 
            name="price" 
            type="number" 
            step="1" 
            placeholder="Precio (sin IVA)" 
            defaultValue={editingProduct?.price || ''} 
            required 
          />
          <Input 
            name="stock" 
            type="number" 
            placeholder="Stock" 
            defaultValue={editingProduct?.stock || ''} 
            required 
          />
          <Input 
            name="category" 
            placeholder="Categoría" 
            defaultValue={editingProduct?.category || ''} 
            required 
          />
          <Select name="iva" defaultValue={editingProduct?.iva?.toString() || '10'}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de IVA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5%</SelectItem>
              <SelectItem value="10">10%</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              {editingProduct ? 'Guardar Cambios' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
