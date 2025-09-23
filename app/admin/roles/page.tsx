"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import {
  getAllRolesAction,
  createRoleAction,
  updateRoleAction,
} from "@/lib/actions/roleActions";
import { getAllPermissions } from "@/lib/actions/permissionActions";
import { RolesHeader } from "@/components/features/admin/roles/roles-header";
import { RolesTableSection } from "@/components/features/admin/roles/roles-table-section";
import {
  RoleFormDialog,
  RoleFormValues,
} from "@/components/features/admin/roles/role-form-dialog";
import {
  PermissionOption,
  RoleWithPermissions,
} from "@/components/features/admin/roles/types";

const PERMISSION_CREATE = "roles:create";
const PERMISSION_UPDATE = "roles:update";
const PERMISSION_READ = "roles:read";

export default function RolesPage() {
  const router = useRouter();
  const { permissions } = useAuth();

  const canCreate =
    permissions.includes(PERMISSION_CREATE) ||
    permissions.includes("roles:manage");
  const canUpdate =
    permissions.includes(PERMISSION_UPDATE) ||
    permissions.includes("roles:manage");
  const canRead =
    permissions.includes(PERMISSION_READ) ||
    permissions.includes("roles:manage");

  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allPermissions, setAllPermissions] = useState<PermissionOption[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllRolesAction(true), getAllPermissions()])
      .then(([rolesResponse, permissionsResponse]) => {
        setRoles(
          rolesResponse.map((role: RoleWithPermissions) => ({
            ...role,
            description: role.description ?? undefined,
          }))
        );
        setAllPermissions(permissionsResponse);
        setError(null);
      })
      .catch(() => setError("Error al cargar roles o permisos"))
      .finally(() => setLoading(false));
  }, []);

  const handleBack = () => {
    router.push("/admin");
  };

  const handleModalChange = (open: boolean) => {
    setIsRoleModalOpen(open);
    if (!open) {
      setEditingRole(null);
    }
  };

  const handleCreateClick = () => {
    setEditingRole(null);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: RoleWithPermissions) => {
    setEditingRole(role);
    setIsRoleModalOpen(true);
  };

  const handleSubmitRole = async ({
    name,
    description,
    permissions,
  }: RoleFormValues) => {
    setError(null);
    try {
      if (editingRole) {
        if (!canUpdate) {
          setError("No tienes permisos para actualizar roles.");
          return;
        }

        const previousPermissions =
          editingRole.permissions?.map((permission) => permission.id) ?? [];
        const permissionsToAdd = permissions.filter(
          (permissionId) => !previousPermissions.includes(permissionId)
        );
        const permissionsToRemove = previousPermissions.filter(
          (permissionId) => !permissions.includes(permissionId)
        );

        const updated = await updateRoleAction(editingRole.id, {
          name,
          description,
          permissionsToAdd,
          permissionsToRemove,
        });

        if (updated && typeof updated.id === "string") {
          setRoles((prev) =>
            prev.map((role) =>
              role.id === updated.id
                ? {
                    ...role,
                    ...updated,
                    description: updated.description ?? undefined,
                  }
                : role
            )
          );
        } else {
          setError("Error: El rol actualizado no es válido.");
          return;
        }
      } else {
        if (!canCreate) {
          setError("No tienes permisos para crear roles.");
          return;
        }

        const created = await createRoleAction({
          name,
          description,
          permissionsToAdd: permissions,
        });

        if (created && typeof created.id === "string") {
          setRoles((prev) => [
            { ...created, description: created.description ?? undefined },
            ...prev,
          ]);
        } else {
          setError("Error: El rol creado no es válido.");
          return;
        }
      }

      handleModalChange(false);
    } catch {
      setError("Error al guardar el rol");
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <RolesHeader
        canCreate={canCreate}
        onBack={handleBack}
        onCreateClick={handleCreateClick}
      />
      <RolesTableSection
        loading={loading}
        error={error}
        roles={roles}
        canRead={canRead}
        canUpdate={canUpdate}
        onEdit={handleEditRole}
      />
      <RoleFormDialog
        open={isRoleModalOpen}
        onOpenChange={handleModalChange}
        allPermissions={allPermissions}
        editingRole={editingRole}
        onSubmit={handleSubmitRole}
      />
    </Card>
  );
}
