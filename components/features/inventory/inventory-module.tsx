'use client'

import { Button } from '@/components/ui/button'
import { Product } from '@/lib/types'
import { Save } from 'lucide-react'
import { useState } from 'react'
import {
  addProductAction,
  editProductAction,
  removeProductAction
} from '@/lib/actions/products'
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

  const handleAddEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    const barcodeValue = formData.get('barcode') as string
    const ivaValue = formData.get('iva') as string
    
    const productData = {
      barcode: parseInt(barcodeValue),
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      category: formData.get('category') as string,
      iva: parseInt(ivaValue),
    }

    try {
      if (editingProduct) {
        // Update existing product using editProductAction
        const result = await editProductAction(editingProduct.id, productData)
        if (result.success) {
          const updatedProduct: Product = {
            ...productData,
            id: editingProduct.id // Preserve the original database-generated ID
          }
          setProducts(prev => prev.map(p => (p.id === editingProduct.id ? updatedProduct : p)))
        } else {
          alert(`Error al actualizar producto: ${result.error || 'Error desconocido'}`)
          return
        }
      } else {
        // Check for duplicate barcode before creating
        if (products.some(p => p.barcode === productData.barcode)) {
          alert('Error: Ya existe un producto con este código de barras.')
          return
        }
        // Create new product using addProductAction
        const result = await addProductAction(productData)
        if (result.success && result.product) {
          setProducts(prev => [...prev, result.product])
        } else {
          alert(`Error al crear producto: ${result.error || 'Error desconocido'}`)
          return
        }
      }
      setIsProductModalOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error al guardar el producto. Por favor, intenta de nuevo.')
    }
  }

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      try {
        const result = await removeProductAction(productToDelete.id)
        if (result.success) {
          setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
          setIsDeleteModalOpen(false)
          setProductToDelete(null)
        } else {
          alert(`Error al eliminar producto: ${result.error || 'Error desconocido'}`)
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Error al eliminar el producto. Por favor, intenta de nuevo.')
      }
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsProductModalOpen(true)
  }

  const handleDeleteClick = (productId: string) => {
    const product = products.find(p => p.id === productId)
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
