'use client'

import { Button } from '@/components/ui/button'
import { Product } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onConfirm: () => void
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  product,
  onConfirm
}: DeleteConfirmDialogProps) {
  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el producto "{product.name}"? 
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            className="bg-red-500 hover:bg-red-600"
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
