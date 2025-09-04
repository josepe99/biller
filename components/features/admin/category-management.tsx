'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, ChevronLeft } from 'lucide-react'
import { Category } from '@prisma/client'
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction
} from '@/lib/actions/categoryActions'


interface CategoryManagementProps {
  onBack: () => void
}

export default function CategoryManagement({ onBack }: CategoryManagementProps) {
  const { permissions, sessionId } = useAuth();
  const canRead = permissions.includes('categories:read');
  const canCreate = permissions.includes('categories:create');
  const canUpdate = permissions.includes('categories:update');
  const canDelete = permissions.includes('categories:delete');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const result = await getCategoriesAction(sessionId!);
      setCategories(result || []);
      setLoading(false);
    }
    if (sessionId) {
      fetchCategories();
    }
  }, [sessionId]);

  const handleAddEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    if (editingCategory) {
      const updated = await updateCategoryAction(sessionId!, editingCategory.id, { name });
      if (updated) {
        setCategories(prev => prev.map(c => (c.id === editingCategory.id ? { ...c, name } : c)));
      }
    } else {
      const created = await createCategoryAction(sessionId!, { name });
      if (created && created.data) {
        setCategories(prev => [...prev, created.data as Category]);
      }
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setFormLoading(false);
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      await deleteCategoryAction(sessionId!, categoryToDelete);
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-orange-500">Gestión de Categorías</CardTitle>
        </div>
        {canCreate && (
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
                  <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)} disabled={formLoading}>Cancelar</Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={formLoading}>
                    {formLoading ? 'Cargando...' : (editingCategory ? 'Guardar Cambios' : 'Agregar')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-auto border rounded-lg">
        {canRead ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Cargando categorías...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
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
                        {canUpdate && (
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
                        )}
                        {canDelete && (
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
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No tienes permiso para ver las categorías.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
