"use client";

import { ReactNode } from "react";
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
import { Edit } from "lucide-react";

import { RoleWithPermissions } from "@/components/features/admin/roles/types";

interface RolesTableSectionProps {
  loading: boolean;
  error: string | null;
  roles: RoleWithPermissions[];
  canRead: boolean;
  canUpdate: boolean;
  emptyState?: ReactNode;
  onEdit: (role: RoleWithPermissions) => void;
}

export function RolesTableSection({
  loading,
  error,
  roles,
  canRead,
  canUpdate,
  emptyState,
  onEdit,
}: RolesTableSectionProps) {
  return (
    <CardContent className="flex-grow overflow-auto border rounded-lg">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-10" />
            </div>
          ))}
        </div>
      ) : canRead ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  {emptyState ?? "No hay roles registrados."}
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(role)}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="text-sm text-muted-foreground">
          No tienes permiso para ver los roles.
        </div>
      )}
    </CardContent>
  );
}
