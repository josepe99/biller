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

  useEffect(() => {
    if (open) {
      setSelectedPermissions(
        editingRole?.permissions?.map((permission) => permission.id) ?? []
      );
    }
  }, [open, editingRole]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

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
      <DialogContent>
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
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
              {allPermissions.map((permission) => (
                <label key={permission.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    disabled={isSubmitting}
                  />
                  {permission.name}
                </label>
              ))}
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
