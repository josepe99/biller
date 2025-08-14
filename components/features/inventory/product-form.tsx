'use client'

import { getCategoriesAction } from '@/lib/actions/categories'
import { PriceInput } from '@/components/ui/price-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { Category } from '@prisma/client'
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
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const categoriesData = await getCategoriesAction()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setIsLoadingCategories(false)
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])
  // Opciones de unidad
  const unityOptions = [
    { value: 'UN', label: 'Unidad' },
    { value: 'KG', label: 'Kilogramo' },
    { value: 'G', label: 'Gramo' },
    { value: 'L', label: 'Litro' },
    { value: 'ML', label: 'Mililitro' },
    { value: 'PACK', label: 'Pack' },
    { value: 'CAJA', label: 'Caja' },
    { value: 'DOC', label: 'Docena' },
    { value: 'PAR', label: 'Par' },
    { value: 'M', label: 'Metro' },
    { value: 'CM', label: 'Centímetro' },
    { value: 'MM', label: 'Milímetro' },
    { value: 'OTRO', label: 'Otro' },
  ];
  // Handler para submit que activa el loading
  const handleSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };
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
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* ...otros campos... */}
          <div className="grid gap-2">
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input
              id="barcode"
              name="barcode"
              type="text"
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
            <Label htmlFor="price">Precio (con IVA)</Label>
            <PriceInput 
              id="price"
              name="price" 
              placeholder="Ej: 100.000 (Guaraníes)" 
              defaultValue={editingProduct?.price || ''} 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="discount">Descuento (%) - Opcional</Label>
            <Input 
              id="discount"
              name="discount" 
              type="number" 
              min="0"
              max="100"
              step="0.01"
              placeholder="Ej: 10" 
              defaultValue={editingProduct?.discount || ''} 
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
            <Select 
              name="category" 
              defaultValue={editingProduct?.category || ''}
              disabled={isLoadingCategories}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={isLoadingCategories ? "Cargando categorías..." : "Selecciona una categoría"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Campo de unidad */}
          <div className="grid gap-2">
            <Label htmlFor="unity">Unidad</Label>
            <Select name="unity" defaultValue={editingProduct?.unity || 'UN'} required>
              <SelectTrigger id="unity">
                <SelectValue placeholder="Unidad" />
              </SelectTrigger>
              <SelectContent>
                {unityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
              {isSubmitting
                ? 'Cargando...'
                : (editingProduct ? 'Guardar Cambios' : 'Agregar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
