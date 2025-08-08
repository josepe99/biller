'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LayoutDashboard, ShoppingCart, Package, Settings, Users, Tag, BarChart, ScanLine, Search, Plus, Edit, Trash2, Printer, Save, X, DollarSign, Clock, CalendarDays, AlertCircle, ChevronLeft } from 'lucide-react'
import Image from 'next/image'

// --- Módulos de la Aplicación ---

interface Product {
  id: string
  name: string
  price: number // Precio sin IVA
  stock: number
  category: string
  ivaType: '5%' | '10%' // Tipo de IVA para el producto
}

interface CartItem extends Product {
  quantity: number
  subtotal: number // Subtotal de este item (cantidad * precio sin IVA)
  unitPriceWithIVA: number; // Nuevo: precio por unidad incluyendo IVA
  unitIVAAmount: number; // Nuevo: monto de IVA por unidad
  lineTotalWithIVA: number; // Nuevo: total de esta línea incluyendo IVA
  lineIVAAmount: number; // Nuevo: total de IVA para esta línea
}

interface User {
  id: string
  name: string
  role: 'admin' | 'cashier'
}

interface Category {
  id: string
  name: string
}

const sampleProducts: Product[] = [
  { id: 'P001', name: 'Coca-Cola 2L', price: 2500, stock: 50, category: 'Bebidas', ivaType: '10%' },
  { id: 'P002', name: 'Pan de Molde', price: 1800, stock: 30, category: 'Panadería', ivaType: '5%' },
  { id: 'P003', name: 'Leche Entera 1L', price: 1200, stock: 10, category: 'Lácteos', ivaType: '5%' },
  { id: 'P004', name: 'Manzanas (kg)', price: 3000, stock: 15, category: 'Frutas', ivaType: '10%' },
  { id: 'P005', name: 'Arroz 1kg', price: 1500, stock: 5, category: 'Granos', ivaType: '5%' }, // Low stock
  { id: 'P006', name: 'Jabón de Baño', price: 900, stock: 2, category: 'Higiene', ivaType: '10%' }, // Low stock
  { id: 'P007', name: 'Libro de Texto', price: 50000, stock: 10, category: 'Educación', ivaType: '5%' },
  { id: 'P008', name: 'Televisor 4K', price: 2500000, stock: 3, category: 'Electrónica', ivaType: '10%' },
  { id: 'P009', name: 'Gaseosa Naranja', price: 2000, stock: 40, category: 'Bebidas', ivaType: '10%' },
  { id: 'P010', name: 'Gaseosa Limón', price: 2000, stock: 35, category: 'Bebidas', ivaType: '10%' },
]

const sampleUsers: User[] = [
  { id: 'U001', name: 'Juan Pérez', role: 'admin' },
  { id: 'U002', name: 'María García', role: 'cashier' },
  { id: 'U003', name: 'Pedro López', role: 'cashier' },
]

const sampleCategories: Category[] = [
  { id: 'C001', name: 'Bebidas' },
  { id: 'C002', name: 'Panadería' },
  { id: 'C003', name: 'Lácteos' },
  { id: 'C004', name: 'Frutas' },
  { id: 'C005', name: 'Granos' },
  { id: 'C006', name: 'Higiene' },
  { id: 'C007', name: 'Educación' },
  { id: 'C008', name: 'Electrónica' },
]

const BillingModule = () => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('') // For main barcode input
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState(''); // For search input inside the modal
  const [filteredModalProducts, setFilteredModalProducts] = useState<Product[]>([]); // Products shown in modal
  const modalSearchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate totals based on the original price (without IVA) for consistency with tax breakdown
  const subtotalWithoutIva = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const iva5PercentAmount = cart
    .filter(item => item.ivaType === '5%')
    .reduce((sum, item) => sum + (item.subtotal * 0.05), 0);
  const iva10PercentAmount = cart
    .filter(item => item.ivaType === '10%')
    .reduce((sum, item) => sum + (item.subtotal * 0.10), 0);
  const totalIvaAmount = iva5PercentAmount + iva10PercentAmount;
  const total = subtotalWithoutIva + totalIvaAmount;

  const calculateItemDetails = (product: Product, quantity: number) => {
    const ivaRate = product.ivaType === '5%' ? 0.05 : 0.10;
    const unitPriceWithIVA = product.price * (1 + ivaRate);
    const unitIVAAmount = product.price * ivaRate;
    const subtotal = quantity * product.price; // Base subtotal without IVA
    const lineIVAAmount = quantity * unitIVAAmount;
    const lineTotalWithIVA = quantity * unitPriceWithIVA;

    return {
      quantity,
      subtotal,
      unitPriceWithIVA,
      unitIVAAmount,
      lineIVAAmount,
      lineTotalWithIVA,
    };
  };

  const addProductToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, ...calculateItemDetails(product, newQuantity) }
            : item
        );
      } else {
        return [...prevCart, { ...product, ...calculateItemDetails(product, 1) }];
      }
    });
    setLastAddedProductId(product.id);
    setTimeout(() => setLastAddedProductId(null), 1000);
  };

  // Function to filter products for the modal
  const filterProductsForModal = (term: string) => {
    const lowerCaseTerm = term.toLowerCase().trim();
    if (!lowerCaseTerm) {
      setFilteredModalProducts(sampleProducts); // Show all products if search term is empty
      return;
    }
    const results = sampleProducts.filter(p =>
      p.id.toLowerCase().includes(lowerCaseTerm) ||
      p.name.toLowerCase().includes(lowerCaseTerm)
    );
    setFilteredModalProducts(results);
  };

  // Effect to debounce modal search input
  useEffect(() => {
    if (modalSearchDebounceRef.current) {
      clearTimeout(modalSearchDebounceRef.current);
    }
    if (isSearchModalOpen) { // Only debounce if modal is open
      modalSearchDebounceRef.current = setTimeout(() => {
        filterProductsForModal(modalSearchTerm);
      }, 300); // Debounce for 300ms
    }
    return () => {
      if (modalSearchDebounceRef.current) {
        clearTimeout(modalSearchDebounceRef.current);
      }
    };
  }, [modalSearchTerm, isSearchModalOpen]);


  const handleMainSearch = () => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerCaseSearchTerm) {
      // If main search is empty, open modal with all products
      setModalSearchTerm(''); // Clear modal search
      filterProductsForModal(''); // Show all products in modal
      setIsSearchModalOpen(true);
      return;
    }

    // Try to find exact barcode match
    const exactProduct = sampleProducts.find(p => p.id.toLowerCase() === lowerCaseSearchTerm);

    if (exactProduct) {
      addProductToCart(exactProduct);
      setSearchTerm(''); // Clear main search input
      setIsSearchModalOpen(false); // Ensure modal is closed
    } else {
      // If no exact barcode match, open modal and pre-fill its search with the current term
      setModalSearchTerm(searchTerm); // Pre-fill modal search with current term
      filterProductsForModal(searchTerm); // Filter modal products based on current term
      setIsSearchModalOpen(true);
    }
  };

  const handleProductSelection = (product: Product) => {
    addProductToCart(product);
    setIsSearchModalOpen(false);
    setModalSearchTerm(''); // Clear modal search term
    setSearchTerm(''); // Clear main search term
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(item => item.id === id);
      if (!itemToUpdate) return prevCart;

      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== id);
      } else {
        return prevCart.map(item =>
          item.id === id
            ? { ...item, ...calculateItemDetails(itemToUpdate, newQuantity) }
            : item
        );
      }
    });
  }

  const handleRemoveItem = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const handleConfirmPayment = () => {
    alert('Venta realizada con éxito!')
    setCart([])
    setIsPaymentModalOpen(false)
  }

  const handleConfirmCancel = () => {
    setCart([])
    setIsCancelModalOpen(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle className="text-orange-500">Facturación</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Buscar por código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleMainSearch()}
              className="flex-grow"
            />
            <Button onClick={handleMainSearch} className="bg-orange-500 hover:bg-orange-600">
              <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
          </div>
          <div className="flex-grow overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Artículo</TableHead><TableHead className="w-[120px] text-right">Precio (con IVA)</TableHead><TableHead className="w-[100px] text-right">IVA (unidad)</TableHead><TableHead className="w-[120px] text-center">Cantidad</TableHead><TableHead className="w-[120px] text-right">Subtotal (con IVA)</TableHead><TableHead className="w-[60px] text-center">Acción</TableHead></TableRow>
              </TableHeader>
              
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No hay artículos en el carrito.</TableCell></TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow key={item.id} className={lastAddedProductId === item.id ? 'bg-orange-50 transition-colors duration-500' : ''}><TableCell className="font-medium">{item.name} <Badge variant="outline" className="ml-2">{item.ivaType}</Badge></TableCell><TableCell className="text-right">Gs {item.unitPriceWithIVA.toFixed(0)}</TableCell><TableCell className="text-right">Gs {item.unitIVAAmount.toFixed(0)}</TableCell><TableCell className="text-center"><Input type="number" value={isNaN(item.quantity) ? '' : item.quantity} onChange={(e) => { const parsedQuantity = parseInt(e.target.value); handleQuantityChange(item.id, isNaN(parsedQuantity) ? 0 : parsedQuantity); }} className="w-20 text-center" min="0" /></TableCell><TableCell className="text-right">Gs {item.lineTotalWithIVA.toFixed(0)}</TableCell><TableCell className="text-center"><Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell></TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-orange-500">Resumen de Venta</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div className="space-y-2 text-lg">
            <div className="flex justify-between">
              <span>Subtotal (sin IVA):</span>
              <span className="font-medium">Gs {subtotalWithoutIva.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Descuento:</span>
              <span className="font-medium">Gs 0</span> {/* Placeholder */}
            </div>
            <div className="flex justify-between">
              <span>IVA 5%:</span>
              <span className="font-medium">Gs {iva5PercentAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA 10%:</span>
              <span className="font-medium">Gs {iva10PercentAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-orange-500 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>Gs {total.toFixed(0)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
              <DialogTrigger asChild>
                <Button className="col-span-2 bg-orange-500 hover:bg-orange-600 text-lg py-6">
                  <DollarSign className="mr-2 h-5 w-5" /> Pagar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Pago</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que deseas procesar el pago por un total de **Gs {total.toFixed(0)}**?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handleConfirmPayment} className="bg-orange-500 hover:bg-orange-600">Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="hover:bg-red-50 hover:text-red-600">
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Cancelación</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de que deseas cancelar la venta actual? Se perderán todos los artículos en el carrito.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>No</Button>
                  <Button onClick={handleConfirmCancel} className="bg-red-500 hover:bg-red-600">Sí, Cancelar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" disabled>
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
            <Button variant="outline" disabled>
              <Save className="mr-2 h-4 w-4" /> Guardar Borrador
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Resultados de Búsqueda / Sugerencias */}
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
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
                      <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleProductSelection(product)}><TableCell className="font-medium">{product.name}</TableCell><TableCell className="text-right">Gs {product.price.toFixed(0)}</TableCell><TableCell className="text-center"><Badge variant="outline">{product.ivaType}</Badge></TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSearchModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const InventoryModule = () => {
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
        alert('Error: Ya existe un producto con este código de barras.');
        return;
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
                {/* New Barcode Input */}
                <Input
                  name="id"
                  placeholder="Código de Barras (ID)"
                  defaultValue={editingProduct?.id || ''}
                  required
                  // If editing, make it read-only to prevent changing existing IDs easily
                  // For simplicity, keeping it editable for now, but in a real app, you might disable it.
                  // disabled={!!editingProduct}
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
              <TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead className="text-right">Precio (sin IVA)</TableHead><TableHead className="text-center">Stock</TableHead><TableHead>Categoría</TableHead><TableHead>IVA</TableHead><TableHead className="text-center">Acciones</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No se encontraron productos.</TableCell></TableRow>
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

// --- Sub-módulos de Administración ---

interface UserManagementProps {
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  onBack: () => void
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, onBack }) => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const handleAddEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const newUser: User = {
      id: editingUser?.id || `U${(users.length + 1).toString().padStart(3, '0')}`,
      name: formData.get('name') as string,
      role: formData.get('role') as 'admin' | 'cashier',
    }

    if (editingUser) {
      setUsers(prev => prev.map(u => (u.id === newUser.id ? newUser : u)))
    } else {
      setUsers(prev => [...prev, newUser])
    }
    setIsUserModalOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete))
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-orange-500">Gestión de Usuarios</CardTitle>
        </div>
        <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setEditingUser(null)}>
              <Plus className="mr-2 h-4 w-4" /> Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Modifica los detalles del usuario.' : 'Ingresa los detalles del nuevo usuario.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEditUser} className="grid gap-4 py-4">
              <Input name="name" placeholder="Nombre del Usuario" defaultValue={editingUser?.name || ''} required />
              <Select name="role" defaultValue={editingUser?.role || 'cashier'}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="cashier">Cajero</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  {editingUser ? 'Guardar Cambios' : 'Agregar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead>Rol</TableHead><TableHead className="text-center">Acciones</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No hay usuarios registrados.</TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrador' : 'Cajero'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingUser(user)
                          setIsUserModalOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Dialog open={isDeleteModalOpen && userToDelete === user.id} onOpenChange={setIsDeleteModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUserToDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar Eliminación</DialogTitle>
                            <DialogDescription>
                              ¿Estás seguro de que deseas eliminar al usuario "{user.name}"? Esta acción no se puede deshacer.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">Eliminar</Button>
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
      </CardContent>
    </Card>
  )
}

interface CategoryManagementProps {
  categories: Category[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
  onBack: () => void
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, setCategories, onBack }) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const handleAddEditCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const newCategory: Category = {
      id: editingCategory?.id || `CAT${(categories.length + 1).toString().padStart(3, '0')}`,
      name: formData.get('name') as string,
    }

    if (editingCategory) {
      setCategories(prev => prev.map(c => (c.id === newCategory.id ? newCategory : c)))
    } else {
      setCategories(prev => [...prev, newCategory])
    }
    setIsCategoryModalOpen(false)
    setEditingCategory(null)
  }

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete))
      setIsDeleteModalOpen(false)
      setCategoryToDelete(null)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-orange-500">Gestión de Categorías</CardTitle>
        </div>
        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setEditingCategory(null)}>
              <Plus className="mr-2 h-4 w-4" /> Agregar Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Modifica el nombre de la categoría.' : 'Ingresa el nombre de la nueva categoría.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEditCategory} className="grid gap-4 py-4">
              <Input name="name" placeholder="Nombre de la Categoría" defaultValue={editingCategory?.name || ''} required />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  {editingCategory ? 'Guardar Cambios' : 'Agregar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead className="text-center">Acciones</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No hay categorías registradas.</TableCell></TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCategory(category)
                          setIsCategoryModalOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Dialog open={isDeleteModalOpen && categoryToDelete === category.id} onOpenChange={setIsDeleteModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCategoryToDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar Eliminación</DialogTitle>
                            <DialogDescription>
                              ¿Estás seguro de que deseas eliminar la categoría "{category.name}"? Esta acción no se puede deshacer.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleDeleteCategory} className="bg-red-500 hover:bg-red-600">Eliminar</Button>
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
      </CardContent>
    </Card>
  )
}


const AdminModule = () => {
  const [adminSubModule, setAdminSubModule] = useState<'overview' | 'users' | 'categories' | 'settings' | 'reports'>('overview')
  const [users, setUsers] = useState<User[]>(sampleUsers)
  const [categories, setCategories] = useState<Category[]>(sampleCategories)

  const renderAdminSubModule = () => {
    switch (adminSubModule) {
      case 'overview':
        return (
          <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => setAdminSubModule('settings')}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Settings className="h-12 w-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Configuración</h3>
                <p className="text-sm text-muted-foreground">IVA, moneda, impresora.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => setAdminSubModule('users')}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Users className="h-12 w-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Usuarios</h3>
                <p className="text-sm text-muted-foreground">Gestionar roles (admin, cajero).</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => setAdminSubModule('categories')}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Tag className="h-12 w-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Categorías</h3>
                <p className="text-sm text-muted-foreground">Organizar productos.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => setAdminSubModule('reports')}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <BarChart className="h-12 w-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Reportes</h3>
                <p className="text-sm text-muted-foreground">Ventas diarias/mensuales.</p>
              </CardContent>
            </Card>
          </CardContent>
        )
      case 'users':
        return <UserManagement users={users} setUsers={setUsers} onBack={() => setAdminSubModule('overview')} />
      case 'categories':
        return <CategoryManagement categories={categories} setCategories={setCategories} onBack={() => setAdminSubModule('overview')} />
      case 'settings':
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <Button variant="ghost" size="icon" onClick={() => setAdminSubModule('overview')} className="self-start mb-4">
              <ChevronLeft className="h-5 w-5" /> Volver
            </Button>
            <h2 className="text-2xl font-bold text-orange-500">Configuración del Sistema</h2>
            <p className="text-muted-foreground mt-2">Aquí se gestionarán las configuraciones de IVA, moneda e impresora.</p>
          </div>
        )
      case 'reports':
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <Button variant="ghost" size="icon" onClick={() => setAdminSubModule('overview')} className="self-start mb-4">
              <ChevronLeft className="h-5 w-5" /> Volver
            </Button>
            <h2 className="text-2xl font-bold text-orange-500">Reportes de Ventas</h2>
            <p className="text-muted-foreground mt-2">Aquí se mostrarán los reportes de ventas diarias y mensuales.</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-orange-500">Panel de Administración</CardTitle>
      </CardHeader>
      {renderAdminSubModule()}
    </Card>
  )
}

// --- Componente Principal de la Aplicación ---

export default function POSSystem() {
  const [activeModule, setActiveModule] = useState('billing') // 'billing', 'inventory', 'admin'
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const lowStockCount = sampleProducts.filter(p => p.stock <= 5).length

  const renderModule = () => {
    switch (activeModule) {
      case 'billing':
        return <BillingModule />
      case 'inventory':
        return <InventoryModule />
      case 'admin':
        return <AdminModule />
      default:
        return <BillingModule />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-20 bg-white border-r shadow-md flex flex-col items-center py-6 space-y-6">
        <div className="mb-6">
          <Image src="/placeholder.svg?height=40&width=40" alt="POS Logo" width={40} height={40} />
        </div>
        <nav className="flex flex-col items-center space-y-4">
          <Button
            variant="ghost"
            size="icon"
            className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${activeModule === 'billing' ? 'bg-orange-100 text-orange-700' : ''}`}
            onClick={() => setActiveModule('billing')}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs mt-1">Facturar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${activeModule === 'inventory' ? 'bg-orange-100 text-orange-700' : ''}`}
            onClick={() => setActiveModule('inventory')}
          >
            <Package className="h-6 w-6" />
            <span className="text-xs mt-1">Stock</span>
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-xs">
                {lowStockCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${activeModule === 'admin' ? 'bg-orange-100 text-orange-700' : ''}`}
            onClick={() => setActiveModule('admin')}
          >
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs mt-1">Admin</span>
          </Button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <Image src="/placeholder.svg?height=30&width=30" alt="POS Icon" width={30} height={30} />
            <h1 className="text-xl font-semibold text-orange-500">r1760 POS</h1>
          </div>
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span>{currentTime.toLocaleDateString()}</span>
            </div>
          </div>
        </header>

        {/* Module Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  )
}
