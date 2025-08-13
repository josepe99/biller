'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, ChevronLeft } from 'lucide-react'
import { User } from '@/lib/types'
import { getAllUsersAction } from '@/lib/actions/userActions'


interface UserManagementProps {
  onBack: () => void
}

export default function UserManagement({ onBack }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      setError(null)
      try {
        const usersArr = await getAllUsersAction()
        // Mapear los campos para que coincidan con el tipo User del frontend
        const mapped = Array.isArray(usersArr)
          ? usersArr.map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              loginAttempts: u.loginAttempts,
              lockedUntil: u.lockedUntil === null ? undefined : u.lockedUntil,
              lastLoginAt: u.lastLoginAt === null ? undefined : u.lastLoginAt,
              createdAt: u.createdAt,
              updatedAt: u.updatedAt,
              deletedAt: u.deletedAt === undefined ? undefined : u.deletedAt,
            }))
          : []
        setUsers(mapped)
      } catch (err) {
        setError('Error al obtener usuarios')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // TODO: Integrar create/update/delete con los actions reales
  const handleAddEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    // ...implementación real pendiente...
    setIsUserModalOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = () => {
    // ...implementación real pendiente...
    setIsDeleteModalOpen(false)
    setUserToDelete(null)
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
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando usuarios...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No hay usuarios registrados.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role === 'ADMIN' ? 'Administrador' : 'Cajero'}
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
        )}
      </CardContent>
    </Card>
  )
}
