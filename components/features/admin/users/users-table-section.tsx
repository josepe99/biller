"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";

import { UserListItem } from "@/components/features/admin/users/types";

interface UsersTableSectionProps {
  loading: boolean;
  error: string | null;
  users: UserListItem[];
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  emptyState?: ReactNode;
  onEdit: (user: UserListItem) => void;
  onDeleteRequest: (user: UserListItem) => void;
}

export function UsersTableSection({
  loading,
  error,
  users,
  canRead,
  canUpdate,
  canDelete,
  emptyState,
  onEdit,
  onDeleteRequest,
}: UsersTableSectionProps) {
  return (
    <CardContent className="flex-grow overflow-auto border rounded-lg">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      ) : canRead ? (
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
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  {emptyState ?? "No hay usuarios registrados."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(user)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteRequest(user)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="text-sm text-muted-foreground">
          No tienes permiso para ver los usuarios.
        </div>
      )}
    </CardContent>
  );
}
