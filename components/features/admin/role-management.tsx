import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
// Permisos requeridos para roles
const PERMISSION_CREATE = 'roles:create';
const PERMISSION_UPDATE = 'roles:update';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, ChevronLeft } from 'lucide-react'
import { RoleType } from '@/lib/types/role'
import { getAllRolesAction, createRoleAction, updateRoleAction } from '@/lib/actions/roles'

interface RoleManagementProps {
  onBack: () => void
}

export default function RoleManagement({ onBack }: RoleManagementProps) {
  // Obtener permisos del usuario actual
  const { permissions } = useAuth();
  // Validadores de permisos
  const canCreate = permissions.includes(PERMISSION_CREATE) || permissions.includes('roles:manage');
  const canUpdate = permissions.includes(PERMISSION_UPDATE) || permissions.includes('roles:manage');
  const [roles, setRoles] = useState<RoleType[]>([])
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getAllRolesAction()
      .then((roles) => setRoles(roles.map(r => ({
        ...r,
        description: r.description ?? undefined,
      }))))
      .catch(() => setError('Error al cargar roles'))
      .finally(() => setLoading(false))
  }, [])

  const handleAddEditRole = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    try {
      if (editingRole) {
        const updated = await updateRoleAction(editingRole.id, { name, description });
        if (updated && typeof updated.id === 'string') {
          setRoles(prev => prev.map(r => (r.id === updated.id ? { ...r, ...updated, description: updated.description ?? undefined } : r)));
        } else {
          setError('Error: El rol actualizado no es válido.');
          return;
        }
      } else {
        const created = await createRoleAction({ name, description });
        if (created && typeof created.id === 'string') {
          setRoles(prev => [{ ...created, description: created.description ?? undefined }, ...prev]);
        } else {
          setError('Error: El rol creado no es válido.');
          return;
        }
      }
      setIsRoleModalOpen(false);
      setEditingRole(null);
    } catch {
      setError('Error al guardar el rol');
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft /></Button>
          <CardTitle>Gestión de Roles</CardTitle>
        </div>
        {/* Mostrar botón de crear solo si tiene permiso */}
        {canCreate && (
          <Button onClick={() => { setIsRoleModalOpen(true); setEditingRole(null) }}><Plus className="mr-2" />Nuevo Rol</Button>
        )}
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  {/* Botón editar solo si tiene permiso */}
                  {canUpdate && (
                    <Button variant="outline" size="icon" onClick={() => { setEditingRole(role); setIsRoleModalOpen(true) }}><Edit /></Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
            <DialogDescription>Complete los campos para {editingRole ? 'editar' : 'crear'} un rol.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEditRole} className="space-y-4">
            <Input name="name" placeholder="Nombre del rol" defaultValue={editingRole?.name} required />
            <Input name="description" placeholder="Descripción" defaultValue={editingRole?.description} />
            <DialogFooter>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
