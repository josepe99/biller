'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
// import { sampleProducts } from '@/lib/data/sample-data'
import { getProductsAction, searchProductsAction } from '@/lib/actions/productActions'
import { formatParaguayanCurrency } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types'


interface ProductSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onProductSelect: (product: Product) => void
  initialSearchTerm?: string
}

export default function ProductSearchModal({ 
  isOpen, 
  onClose, 
  onProductSelect, 
  initialSearchTerm = '' 
}: ProductSearchModalProps) {
  const [modalSearchTerm, setModalSearchTerm] = useState('')
  const [filteredModalProducts, setFilteredModalProducts] = useState<Product[]>([])
  const modalSearchDebounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      const products = await getProductsAction(30)
      setFilteredModalProducts(products)
    }
    fetchProducts()
  }, [])

  // Function to filter products for the modal usando el action real
  const filterProductsForModal = async (term: string) => {
    const searchTerm = term.trim()
    if (!searchTerm) {
      const products = await getProductsAction(30)
      setFilteredModalProducts(products)
      return
    }
    const results = await searchProductsAction(searchTerm)
    setFilteredModalProducts(results)
  }

  // Effect to debounce modal search input
  useEffect(() => {
    if (modalSearchDebounceRef.current) {
      clearTimeout(modalSearchDebounceRef.current)
    }
    if (isOpen) { // Only debounce if modal is open
      modalSearchDebounceRef.current = setTimeout(() => {
        filterProductsForModal(modalSearchTerm)
      }, 300) // Debounce for 300ms
    }
    return () => {
      if (modalSearchDebounceRef.current) {
        clearTimeout(modalSearchDebounceRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalSearchTerm, isOpen])

  // Set initial search term when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalSearchTerm(initialSearchTerm)
      filterProductsForModal(initialSearchTerm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialSearchTerm])

  const handleProductSelection = (product: Product) => {
    onProductSelect(product)
    setModalSearchTerm('') // Clear modal search term
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buscar y Seleccionar Producto</DialogTitle>
          <DialogDescription>
            Ingresa el nombre o código del producto para buscar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Buscar por nombre o código..."
            value={modalSearchTerm}
            onChange={(e) => setModalSearchTerm(e.target.value)}
            className="w-full"
          />
          <div className="max-h-[300px] overflow-y-auto border rounded-md">
            {filteredModalProducts.length === 0 && modalSearchTerm.length > 0 ? (
              <p className="text-center text-muted-foreground py-4">No se encontraron productos.</p>
            ) : filteredModalProducts.length === 0 && modalSearchTerm.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Escribe para buscar productos.</p>
            ) : (
              <Table>
                <TableBody>
                  {filteredModalProducts.map((product) => (
                    <TableRow 
                      key={product.id} 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => handleProductSelection(product)}
                    >
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{formatParaguayanCurrency(product.price)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">IVA {product.iva}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
