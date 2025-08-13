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
import { getAllRolesAction, createRoleAction, updateRoleAction } from '@/lib/actions/roleActions'
import { getAllPermissions } from '@/lib/actions/permissionActions'

interface RoleManagementProps {
  onBack: () => void
}

export default function RoleManagement({ onBack }: RoleManagementProps) {
  // Obtener permisos del usuario actual
  const { permissions } = useAuth();
  // Validadores de permisos
  const canCreate = permissions.includes(PERMISSION_CREATE) || permissions.includes('roles:manage');
  const canUpdate = permissions.includes(PERMISSION_UPDATE) || permissions.includes('roles:manage');

  const [roles, setRoles] = useState<any[]>([])
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allPermissions, setAllPermissions] = useState<{ id: string; name: string }[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])


  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAllRolesAction(true),
      getAllPermissions()
    ])
      .then(([roles, permissions]) => {
        setRoles(roles.map((r: any) => ({
          ...r,
          description: r.description ?? undefined,
        })));
        setAllPermissions(permissions);
      })
      .catch(() => setError('Error al cargar roles o permisos'))
      .finally(() => setLoading(false))
  }, [])

  // Cuando se abre el modal, setear permisos seleccionados
  useEffect(() => {
    if (isRoleModalOpen) {
      if (editingRole) {
        setSelectedPermissions(editingRole.permissions?.map((p: any) => p.id) || []);
      } else {
        setSelectedPermissions([]);
      }
    }
  }, [isRoleModalOpen, editingRole]);

  const handleAddEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    try {
      if (editingRole) {
        // Calcular permisos a agregar y quitar
        const prevPermissions: string[] = editingRole.permissions?.map((p: any) => p.id) || [];
        const permissionsToAdd = selectedPermissions.filter((id) => !prevPermissions.includes(id));
        const permissionsToRemove = prevPermissions.filter((id) => !selectedPermissions.includes(id));
        const updated = await updateRoleAction(editingRole.id, { name, description, permissionsToAdd, permissionsToRemove });
        if (updated && typeof updated.id === 'string') {
          setRoles(prev => prev.map(r => (r.id === updated.id ? { ...r, ...updated, description: updated.description ?? undefined } : r)));
        } else {
          setError('Error: El rol actualizado no es válido.');
          return;
        }
      } else {
        const created = await createRoleAction({ name, description, permissionsToAdd: selectedPermissions });
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
  };

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

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
            <div>
              <div className="font-semibold mb-2">Permisos</div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                {allPermissions.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handlePermissionChange(perm.id)}
                    />
                    {perm.name}
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
