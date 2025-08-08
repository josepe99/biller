'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Save } from 'lucide-react'
import { Product } from '@/lib/types'
import { sampleProducts } from '@/lib/data/sample-data'

export default function InventoryModule() {
  const [products, setProducts] = useState<Product[]>(sampleProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('Todas')
  const [filterStock, setFilterStock] = useState('Todos')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const categories = Array.from(new Set(sampleProducts.map(p => p.category)))

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'Todas' || product.category === filterCategory
    const matchesStock = filterStock === 'Todos' ||
                         (filterStock === 'Bajo' && product.stock <= 5) ||
                         (filterStock === 'Suficiente' && product.stock > 5)
    return matchesSearch && matchesCategory && matchesStock
  })

  const handleAddEditProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const newProduct: Product = {
      // Use the 'id' from the form for barcode
      id: formData.get('id') as string,
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      category: formData.get('category') as string,
      ivaType: formData.get('ivaType') as '5%' | '10%',
    }

    if (editingProduct) {
      setProducts(prev => prev.map(p => (p.id === newProduct.id ? newProduct : p)))
    } else {
      // Check for duplicate ID when adding new product
      if (products.some(p => p.id === newProduct.id)) {
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
      setProducts(prev => prev.filter(p => p.id !== productToDelete))
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-orange-500">Stock / Inventario</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
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
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
          <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-orange-500 hover:bg-orange-600 ml-auto"
                onClick={() => setEditingProduct(null)}
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Modifica los detalles del producto.' : 'Ingresa los detalles del nuevo producto.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEditProduct} className="grid gap-4 py-4">
                <Input
                  name="id"
                  placeholder="Código de Barras (ID)"
                  defaultValue={editingProduct?.id || ''}
                  required
                />
                <Input name="name" placeholder="Nombre del Producto" defaultValue={editingProduct?.name || ''} required />
                <Input name="price" type="number" step="1" placeholder="Precio (sin IVA)" defaultValue={editingProduct?.price || ''} required />
                <Input name="stock" type="number" placeholder="Stock" defaultValue={editingProduct?.stock || ''} required />
                <Input name="category" placeholder="Categoría" defaultValue={editingProduct?.category || ''} required />
                <Select name="ivaType" defaultValue={editingProduct?.ivaType || '10%'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de IVA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5%">5%</SelectItem>
                    <SelectItem value="10%">10%</SelectItem>
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    {editingProduct ? 'Guardar Cambios' : 'Agregar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-grow overflow-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Precio (sin IVA)</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>IVA</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No se encontraron productos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">Gs {product.price.toFixed(0)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.stock <= 5 ? 'destructive' : 'secondary'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell><Badge variant="outline">{product.ivaType}</Badge></TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProduct(product)
                            setIsProductModalOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Dialog open={isDeleteModalOpen && productToDelete === product.id} onOpenChange={setIsDeleteModalOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setProductToDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmar Eliminación</DialogTitle>
                              <DialogDescription>
                                ¿Estás seguro de que deseas eliminar el producto "{product.name}"? Esta acción no se puede deshacer.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                              <Button onClick={handleDeleteProduct} className="bg-red-500 hover:bg-red-600">Eliminar</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" disabled>
            <Save className="mr-2 h-4 w-4" /> Exportar Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
