"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  PermissionOption,
  RoleWithPermissions,
} from "@/components/features/admin/roles/types";

export interface RoleFormValues {
  name: string;
  description: string;
  permissions: string[];
}

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allPermissions: PermissionOption[];
  editingRole: RoleWithPermissions | null;
  onSubmit: (values: RoleFormValues) => Promise<void>;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  allPermissions,
  editingRole,
  onSubmit,
}: RoleFormDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedPermissions(
        editingRole?.permissions?.map((permission) => permission.id) ?? []
      );
      setPermissionSearchTerm(""); // Resetear búsqueda al abrir modal
    }
  }, [open, editingRole]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Función para generar descripción legible desde el nombre técnico
  const getPermissionDisplayText = (permission: PermissionOption) => {
    if (permission.description && permission.description.trim()) {
      return permission.description;
    }

    // Generar descripción legible desde el nombre técnico
    const [resource, action] = permission.name.split(':');
    const resourceMap: Record<string, string> = {
      'users': 'usuarios',
      'products': 'productos',
      'sales': 'ventas',
      'inventory': 'inventario',
      'roles': 'roles',
      'cashRegister': 'caja registradora',
      'categories': 'categorías',
      'checkout': 'checkout',
      'creditNotes': 'notas de crédito'
    };

    const actionMap: Record<string, string> = {
      'create': 'Crear',
      'read': 'Ver',
      'update': 'Actualizar',
      'delete': 'Eliminar',
      'manage': 'Gestionar',
      'open': 'Abrir',
      'close': 'Cerrar',
      'start': 'Iniciar',
      'finalize': 'Finalizar',
      'cancel': 'Cancelar',
      'get': 'Obtener',
      'discount': 'Aplicar descuentos',
      'refund': 'Procesar reembolsos',
      'add_items': 'Agregar artículos',
      'remove_items': 'Remover artículos',
      'apply_discount': 'Aplicar descuentos',
      'apply_promotion': 'Aplicar promociones',
      'select_payment': 'Seleccionar método de pago'
    };

    const resourceText = resourceMap[resource] || resource;
    const actionText = actionMap[action] || action;

    return `${actionText} ${resourceText}`;
  };

  // Filtrar permisos basado en el término de búsqueda
  const filteredPermissions = allPermissions.filter((permission) => {
    const searchLower = permissionSearchTerm.toLowerCase();
    const displayText = getPermissionDisplayText(permission);
    return (
      permission.name.toLowerCase().includes(searchLower) ||
      displayText.toLowerCase().includes(searchLower)
    );
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = (formData.get("name") as string) ?? "";
    const description = (formData.get("description") as string) ?? "";

    setIsSubmitting(true);
    try {
      await onSubmit({ name, description, permissions: selectedPermissions });
    } catch {
      // El contenedor maneja los mensajes de error cuando la operación falla
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingRole ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
          <DialogDescription>
            Complete los campos para {editingRole ? "editar" : "crear"} un rol.
          </DialogDescription>
        </DialogHeader>
        <form
          key={editingRole?.id ?? "new-role"}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Input
            name="name"
            placeholder="Nombre del rol"
            defaultValue={editingRole?.name}
            required
            disabled={isSubmitting}
          />
          <Input
            name="description"
            placeholder="Descripción"
            defaultValue={editingRole?.description ?? ""}
            disabled={isSubmitting}
          />
          <div>
            <div className="font-semibold mb-2">Permisos</div>
            <Input
              placeholder="Buscar permisos..."
              value={permissionSearchTerm}
              onChange={(e) => setPermissionSearchTerm(e.target.value)}
              className="mb-2"
              disabled={isSubmitting}
            />
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto border rounded p-2">
              {filteredPermissions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  {permissionSearchTerm ? 'No se encontraron permisos' : 'No hay permisos disponibles'}
                </div>
              ) : (
                filteredPermissions.map((permission) => (
                  <label key={permission.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {getPermissionDisplayText(permission)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {permission.name}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cargando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
