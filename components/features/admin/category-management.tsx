'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, ChevronLeft } from 'lucide-react'
import { Category } from '@/lib/types'

interface CategoryManagementProps {
  categories: Category[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
  onBack: () => void
}

export default function CategoryManagement({ categories, setCategories, onBack }: CategoryManagementProps) {
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
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No hay categorías registradas.
                </TableCell>
              </TableRow>
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
