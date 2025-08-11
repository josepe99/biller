'use client'

import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Product } from '@/lib/types'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ProductFilters,
  ProductForm,
  ProductTable,
  DeleteConfirmDialog
} from './index'

export default function InventoryModule({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todas')
  const [filterStock, setFilterStock] = useState('Todos')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const categories = Array.from(new Set(initialProducts.map(p => typeof p.category === 'string' ? p.category : 'Sin categoría')))

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.barcode.toString().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'Todas' || product.category === filterCategory
    const matchesStock = filterStock === 'Todos' ||
                         (filterStock === 'Bajo' && product.stock <= 5) ||
                         (filterStock === 'Suficiente' && product.stock > 5)
    return matchesSearch && matchesCategory && matchesStock
  })

  const handleAddEditProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const barcodeValue = formData.get('barcode') as string
    const ivaValue = formData.get('iva') as string
    
    const newProduct: Product = {
      id: barcodeValue, // Use barcode as id
      barcode: parseInt(barcodeValue), // Convert to number
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      category: formData.get('category') as string,
      iva: parseInt(ivaValue),
    }

    if (editingProduct) {
      setProducts(prev => prev.map(p => (p.barcode === newProduct.barcode ? newProduct : p)))
    } else {
      // Check for duplicate barcode when adding new product
      if (products.some(p => p.barcode === newProduct.barcode)) {
        alert('Error: Ya existe un producto con este código de barras.')
        return
      }
      setProducts(prev => [...prev, newProduct])
    }
    setIsProductModalOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.barcode !== productToDelete.barcode))
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsProductModalOpen(true)
  }

  const handleDeleteClick = (barcode: number) => {
    const product = products.find(p => p.barcode === barcode)
    if (product) {
      setProductToDelete(product)
      setIsDeleteModalOpen(true)
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsProductModalOpen(true)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-orange-500">Stock / Inventario</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <ProductFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterStock={filterStock}
          setFilterStock={setFilterStock}
          categories={categories}
          onAddProduct={handleAddProduct}
        />

        <ProductTable
          products={filteredProducts}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteClick}
        />

        <div className="mt-4 flex justify-end">
          <Button variant="outline" disabled>
            <Save className="mr-2 h-4 w-4" /> Exportar Excel
          </Button>
        </div>
      </CardContent>

      <ProductForm
        isOpen={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        editingProduct={editingProduct}
        onSubmit={handleAddEditProduct}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        product={productToDelete}
        onConfirm={handleDeleteProduct}
      />
    </Card>
  )
}
