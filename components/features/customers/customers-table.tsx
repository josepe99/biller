"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CustomerListItem } from "@/components/features/customers/types";

interface CustomersTableProps {
  customers: CustomerListItem[];
  loading: boolean;
  error: string | null;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  emptyState?: ReactNode;
  onEdit: (customer: CustomerListItem) => void;
  onDelete: (customer: CustomerListItem) => void;
}

export function CustomersTable({
  customers,
  loading,
  error,
  canRead,
  canUpdate,
  canDelete,
  emptyState,
  onEdit,
  onDelete,
}: CustomersTableProps) {
  return (
    <div className="bg-white rounded shadow p-4">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      ) : canRead ? (
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>RUC</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {emptyState ?? "No hay clientes registrados."}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const createdAt = customer.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString("es-PY")
                  : "-";

                return (
                  <TableRow key={customer.id} className="border-b last:border-0">
                    <TableCell>{customer.ruc || "-"}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell>{createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(customer)}
                          >
                            Editar
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDelete(customer)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="text-sm text-muted-foreground">
          No tienes permiso para ver los clientes.
        </div>
      )}
    </div>
  );
}
