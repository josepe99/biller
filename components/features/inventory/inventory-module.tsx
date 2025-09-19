'use client'

import { getCategoriesAction } from '@/lib/actions/categories'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Product } from '@/lib/types'
import { Category } from '@prisma/client'
import { Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  addProductAction,
  editProductAction,
  removeProductAction
} from '@/lib/actions/productActions'
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
  const { permissions = [] } = useAuth();
  const canRead = permissions.includes('products:read');
  const canCreate = permissions.includes('products:create');
  const canUpdate = permissions.includes('products:update');
  const canDelete = permissions.includes('products:delete');
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todas')
  const [filterStock, setFilterStock] = useState('Todos')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [categoriesData, setCategoriesData] = useState<Category[]>([])

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getCategoriesAction()
        setCategoriesData(categories)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

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
    const discountValue = formData.get('discount') as string
    const categoryName = formData.get('category') as string

    // Find the categoryId based on the category name
    const selectedCategory = categoriesData.find(cat => cat.name === categoryName)
    const categoryId = selectedCategory?.id || null

    const productData = {
      barcode: barcodeValue,
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      categoryId: categoryId, // Use categoryId instead of category
      iva: parseInt(ivaValue),
      discount: discountValue ? parseFloat(discountValue) : undefined,
      unity: formData.get('unity') as string,
    }

    try {
      if (editingProduct) {
        // Update existing product using editProductAction
        const updatedProduct = await editProductAction(editingProduct.id, productData)
        if (updatedProduct) {
          setProducts(prev => prev.map(p => (p.id === editingProduct.id ? updatedProduct : p)))
        } else {
          alert('Error al actualizar producto')
          return
        }
      } else {
        // Check for duplicate barcode before creating
        if (products.some(p => p.barcode === productData.barcode)) {
          alert('Error: Ya existe un producto con este código de barras.')
          return
        }
        // Create new product using addProductAction
        const newProduct = await addProductAction(productData)
        if (newProduct) {
          // Asegurarse de que el producto tenga el campo discount
          setProducts(prev => [
            ...prev,
            {
              ...newProduct,
              discount: (newProduct as any).discount !== undefined ? (newProduct as any).discount : 0
            }
          ])
        } else {
          alert('Error al crear producto')
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
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="text-orange-500">Stock / Inventario</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-4">
        <ProductFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterStock={filterStock}
          setFilterStock={setFilterStock}
          categories={categories}
          onAddProduct={canCreate ? handleAddProduct : undefined}
          canCreate={canCreate}
        />

        {canRead ? (
          <div className="flex-grow mt-4 h-full">
            <ProductTable
              products={filteredProducts}
              onEditProduct={canUpdate ? handleEditProduct : undefined}
              onDeleteProduct={canDelete ? handleDeleteClick : undefined}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">No tienes permiso para ver productos.</div>
        )}
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
