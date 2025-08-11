'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PriceInput } from '@/components/ui/price-input'
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
          <div className="grid gap-2">
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input
              id="barcode"
              name="barcode"
              type="number"
              placeholder="Código de Barras"
              defaultValue={editingProduct?.barcode || ''}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input 
              id="name"
              name="name" 
              placeholder="Nombre del Producto" 
              defaultValue={editingProduct?.name || ''} 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Precio (sin IVA)</Label>
            <PriceInput 
              id="price"
              name="price" 
              placeholder="Ej: 100.000 (Guaraníes)" 
              defaultValue={editingProduct?.price || ''} 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stock">Stock</Label>
            <Input 
              id="stock"
              name="stock" 
              type="number" 
              placeholder="Stock" 
              defaultValue={editingProduct?.stock || ''} 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Categoría</Label>
            <Input 
              id="category"
              name="category" 
              placeholder="Categoría" 
              defaultValue={editingProduct?.category || ''} 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="iva">Tipo de IVA</Label>
            <Select name="iva" defaultValue={editingProduct?.iva?.toString() || '10'}>
              <SelectTrigger id="iva">
                <SelectValue placeholder="Tipo de IVA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
