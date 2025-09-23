"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  RoleOption,
  UserListItem,
} from "@/components/features/admin/users/types";

export interface UserFormValues {
  name: string;
  role: string;
  email?: string;
  password?: string;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleOption[];
  editingUser: UserListItem | null;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export function UserFormDialog({
  open,
  onOpenChange,
  roles,
  editingUser,
  onSubmit,
}: UserFormDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultRole = useMemo(() => {
    if (editingUser) {
      return String(editingUser.role);
    }

    return roles[0]?.name ?? "";
  }, [editingUser, roles]);

  useEffect(() => {
    if (open) {
      setSelectedRole(defaultRole);
    }
  }, [open, defaultRole]);

  const isSubmitDisabled = isSubmitting || !selectedRole;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = (formData.get("name") as string) ?? "";
    const email = (formData.get("email") as string) || undefined;
    const password = (formData.get("password") as string) || undefined;

    if (!selectedRole) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        role: selectedRole,
        email,
        password,
      });
    } catch {
      // Los errores se manejan en el contenedor (toast o estado)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Modifica los detalles del usuario."
              : "Ingresa los detalles del nuevo usuario."}
          </DialogDescription>
        </DialogHeader>
        <form
          key={editingUser?.id ?? "new-user"}
          onSubmit={handleSubmit}
          className="grid gap-4 py-4"
        >
          <Input
            name="name"
            placeholder="Nombre del Usuario"
            defaultValue={editingUser?.name ?? ""}
            required
            disabled={isSubmitting}
          />
          {!editingUser && (
            <Input
              name="email"
              placeholder="Email"
              type="email"
              required
              disabled={isSubmitting}
            />
          )}
          {!editingUser && (
            <Input
              name="password"
              placeholder="Contraseña"
              type="password"
              required
              disabled={isSubmitting}
            />
          )}
          <div className="space-y-2">
            <div className="font-semibold">Rol</div>
            <input type="hidden" name="role" value={selectedRole} />
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={isSubmitting || roles.length === 0}
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
              disabled={isSubmitDisabled}
            >
              {isSubmitting
                ? "Cargando..."
                : editingUser
                ? "Guardar Cambios"
                : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
