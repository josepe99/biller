'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

interface ProductFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterCategory: string
  setFilterCategory: (category: string) => void
  filterStock: string
  setFilterStock: (stock: string) => void
  categories: string[]
  onAddProduct: () => void
}

export function ProductFilters({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterStock,
  setFilterStock,
  categories,
  onAddProduct
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <Input
        placeholder="Buscar producto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow max-w-xs"
      />
      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
        className="p-2 border rounded-md"
      >
        <option value="Todas">Todas las Categorías</option>
        {categories.map((cat, index) => (
          <option key={`category-${index}-${cat}`} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <select
        value={filterStock}
        onChange={(e) => setFilterStock(e.target.value)}
        className="p-2 border rounded-md"
      >
        <option value="Todos">Todo el Stock</option>
        <option value="Bajo">Stock Bajo (&lt;= 5)</option>
        <option value="Suficiente">Stock Suficiente (&gt; 5)</option>
      </select>
      <Button
        className="bg-orange-500 hover:bg-orange-600 ml-auto"
        onClick={onAddProduct}
      >
        <Plus className="mr-2 h-4 w-4" /> Agregar Producto
      </Button>
    </div>
  )
}
