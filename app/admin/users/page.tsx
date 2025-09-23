"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import {
  createUserAction,
  getAllUsersAction,
  softDeleteUserAction,
  updateUserAction,
} from "@/lib/actions/userActions";
import { getAllRolesAction } from "@/lib/actions/roleActions";
import { UsersHeader } from "@/components/features/admin/users/users-header";
import { UsersTableSection } from "@/components/features/admin/users/users-table-section";
import {
  UserFormDialog,
  UserFormValues,
} from "@/components/features/admin/users/user-form-dialog";
import { UserDeleteDialog } from "@/components/features/admin/users/user-delete-dialog";
import {
  RoleOption,
  UserListItem,
} from "@/components/features/admin/users/types";

const PERMISSION_CREATE = "users:create";
const PERMISSION_UPDATE = "users:update";
const PERMISSION_DELETE = "users:delete";
const PERMISSION_READ = "users:read";
const PERMISSION_MANAGE = "users:manage";

function mapUsersResponse(response: unknown): UserListItem[] {
  if (!Array.isArray(response)) {
    return [];
  }

  return response.map((user: any) => ({
    id: String(user.id ?? ""),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    role: user.role ?? "",
    loginAttempts: user.loginAttempts ?? undefined,
    lockedUntil:
      user.lockedUntil === null || user.lockedUntil === undefined
        ? undefined
        : new Date(user.lockedUntil),
    lastLoginAt:
      user.lastLoginAt === null || user.lastLoginAt === undefined
        ? undefined
        : new Date(user.lastLoginAt),
    createdAt:
      user.createdAt === null || user.createdAt === undefined
        ? undefined
        : new Date(user.createdAt),
    updatedAt:
      user.updatedAt === null || user.updatedAt === undefined
        ? undefined
        : new Date(user.updatedAt),
    deletedAt:
      user.deletedAt === null || user.deletedAt === undefined
        ? undefined
        : new Date(user.deletedAt),
  }));
}

function mapRolesResponse(response: unknown): RoleOption[] {
  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .filter((role: any) => role?.id && role?.name)
    .map((role: any) => ({
      id: String(role.id),
      name: String(role.name),
    }));
}

export default function UsersPage() {
  const router = useRouter();
  const { permissions } = useAuth();

  const canManage = permissions.includes(PERMISSION_MANAGE);
  const canCreate =
    canManage || permissions.includes(PERMISSION_CREATE);
  const canUpdate =
    canManage || permissions.includes(PERMISSION_UPDATE);
  const canDelete =
    canManage || permissions.includes(PERMISSION_DELETE);
  const canRead = canManage || permissions.includes(PERMISSION_READ);

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const handleDeleteDialogChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) {
      setUserToDelete(null);
    }
  };
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllUsersAction(), getAllRolesAction(false)])
      .then(([usersResponse, rolesResponse]) => {
        setUsers(mapUsersResponse(usersResponse));
        setRoles(mapRolesResponse(rolesResponse));
        setError(null);
      })
      .catch(() => setError("Error al cargar usuarios o roles."))
      .finally(() => setLoading(false));
  }, []);

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const usersResponse = await getAllUsersAction();
      setUsers(mapUsersResponse(usersResponse));
    } catch {
      setError("Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/admin");
  };

  const handleModalChange = (open: boolean) => {
    setIsUserModalOpen(open);
    if (!open) {
      setEditingUser(null);
    }
  };

  const handleCreateClick = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: UserListItem) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleSubmitUser = async ({
    name,
    role,
    email,
    password,
  }: UserFormValues) => {
    setError(null);
    try {
      if (editingUser) {
        if (!canUpdate) {
          setError("No tienes permisos para actualizar usuarios.");
          return;
        }

        await updateUserAction(editingUser.id, {
          name,
          role: role as UserRole,
        });
      } else {
        if (!canCreate) {
          setError("No tienes permisos para crear usuarios.");
          return;
        }

        if (!email || !password) {
          setError("Email y contraseña son obligatorios para crear usuarios.");
          return;
        }

        await createUserAction({
          name,
          email,
          password,
          role: role as UserRole,
        });
      }

      await refreshUsers();
      handleModalChange(false);
    } catch {
      setError("Error al guardar el usuario.");
    }
  };

  const handleDeleteRequest = (user: UserListItem) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) {
      return;
    }

    if (!canDelete) {
      setError("No tienes permisos para eliminar usuarios.");
      return;
    }

    setIsDeleting(true);
    try {
      await softDeleteUserAction(userToDelete.id);
      await refreshUsers();
      handleDeleteDialogChange(false);
    } catch {
      setError("Error al eliminar el usuario.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <UsersHeader
        canCreate={canCreate}
        onBack={handleBack}
        onCreateClick={handleCreateClick}
      />
      <UsersTableSection
        loading={loading}
        error={error}
        users={users}
        canRead={canRead}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onEdit={handleEditUser}
        onDeleteRequest={handleDeleteRequest}
      />
      <UserFormDialog
        open={isUserModalOpen}
        onOpenChange={handleModalChange}
        roles={roles}
        editingUser={editingUser}
        onSubmit={handleSubmitUser}
      />
      <UserDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        user={userToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </Card>
  );
}
