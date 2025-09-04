'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft
} from 'lucide-react'
import {
  getAllUsersAction,
  updateUserAction,
  createUserAction
} from '@/lib/actions/userActions'
import { getAllRolesAction } from '@/lib/actions/roleActions'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { UserRole } from '@prisma/client'
import { User } from '@prisma/client'

// Tipo local para la lista de usuarios en la UI
type UserListItem = Pick<User, 'id' | 'name' | 'email' | 'role'> & {
  loginAttempts?: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};
// Permisos para acciones sobre usuarios
const PERMISSION_CREATE = 'users:create';
const PERMISSION_UPDATE = 'users:update';
const PERMISSION_DELETE = 'users:delete';


interface UserManagementProps {
  onBack: () => void
}

export default function UserManagement({ onBack }: UserManagementProps) {
  // Obtener permisos y session del usuario actual
  const { permissions, sessionId } = useAuth()
  // Validadores de permisos
  const canCreate = permissions.includes(PERMISSION_CREATE) || permissions.includes('users:create');
  const canUpdate = permissions.includes(PERMISSION_UPDATE) || permissions.includes('users:update');
  const canDelete = permissions.includes(PERMISSION_DELETE) || permissions.includes('users:delete');
  const [users, setUsers] = useState<UserListItem[]>([])
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<any[]>([])
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [usersArr, rolesArr] = await Promise.all([
        getAllUsersAction(),
        getAllRolesAction(sessionId!, false)
      ]);
      const mapped: UserListItem[] = Array.isArray(usersArr)
        ? usersArr.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || '',
            loginAttempts: u.loginAttempts,
            lockedUntil: u.lockedUntil === null ? undefined : u.lockedUntil,
            lastLoginAt: u.lastLoginAt === null ? undefined : u.lastLoginAt,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
            deletedAt: u.deletedAt === undefined ? undefined : u.deletedAt,
          }))
        : [];
      setUsers(mapped);
      setRoles(Array.isArray(rolesArr) ? rolesArr : []);
      setLoading(false);
    }
    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  const handleAddEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const userRole = (role as UserRole);
    try {
      if (editingUser && canUpdate) {
        await updateUserAction(editingUser.id, { name, role: userRole });
      } else if (canCreate) {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        await createUserAction({ name, email, password, role: userRole });
      }
      // Refrescar lista de usuarios y mapear como en useEffect
      setLoading(true);
      const usersArr = await getAllUsersAction();
      const mapped: UserListItem[] = Array.isArray(usersArr)
        ? usersArr.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || '',
            loginAttempts: u.loginAttempts,
            lockedUntil: u.lockedUntil === null ? undefined : u.lockedUntil,
            lastLoginAt: u.lastLoginAt === null ? undefined : u.lastLoginAt,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
            deletedAt: u.deletedAt === undefined ? undefined : u.deletedAt,
          }))
        : [];
      setUsers(mapped);
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      // Puedes agregar un toast aquí si quieres mostrar error
    } finally {
      setFormLoading(false);
      setLoading(false);
    }
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
        {/* Mostrar botón de crear solo si tiene permiso */}
        {canCreate && (
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
                <Input name="name" placeholder="Nombre del Usuario" defaultValue={editingUser?.name || ''} required disabled={formLoading} />
                {!editingUser && (
                  <Input name="email" placeholder="Email" type="email" required disabled={formLoading} />
                )}
                {!editingUser && (
                  <Input name="password" placeholder="Contraseña" type="password" required disabled={formLoading} />
                )}
                <Select
                  name="role"
                  defaultValue={
                    editingUser
                      ? roles.find(r => r.name.toLowerCase() === String(editingUser.role).toLowerCase())?.name || ''
                      : (roles[0]?.name || '')
                  }
                  required
                  disabled={formLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUserModalOpen(false)} disabled={formLoading}>Cancelar</Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={formLoading}>
                    {formLoading ? 'Cargando...' : (editingUser ? 'Guardar Cambios' : 'Agregar')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-auto border rounded-lg">
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                    <Badge variant="secondary">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {/* Botón editar solo si tiene permiso */}
                      {canUpdate && (
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
                      )}
                      {/* Botón eliminar solo si tiene permiso */}
                      {canDelete && (
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
                      )}
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
