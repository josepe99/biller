"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/components/auth/auth-provider";
import {
  getAllCustomers,
  searchCustomers,
  deleteCustomer,
} from "@/lib/actions/customerActions";
import { CustomersHeader } from "@/components/features/customers/customers-header";
import { CustomersSearchBar } from "@/components/features/customers/customers-search-bar";
import { CustomersTable } from "@/components/features/customers/customers-table";
import { CustomerFormDialog } from "@/components/features/customers/customer-form-dialog";
import { CustomerDeleteDialog } from "@/components/features/customers/customer-delete-dialog";
import {
  CustomerListItem,
} from "@/components/features/customers/types";

const PERMISSION_CREATE = "customers:create";
const PERMISSION_READ = "customers:read";
const PERMISSION_UPDATE = "customers:update";
const PERMISSION_DELETE = "customers:delete";
const PERMISSION_MANAGE = "customers:manage";

function mapCustomersResponse(data: unknown): CustomerListItem[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((customer: any) => ({
    id: String(customer?.id ?? ""),
    name: String(customer?.name ?? ""),
    email: customer?.email ?? null,
    phone: customer?.phone ?? null,
    ruc: customer?.ruc ?? null,
    createdAt:
      customer?.createdAt !== undefined && customer?.createdAt !== null
        ? new Date(customer.createdAt)
        : undefined,
    updatedAt:
      customer?.updatedAt !== undefined && customer?.updatedAt !== null
        ? new Date(customer.updatedAt)
        : undefined,
    deletedAt:
      customer?.deletedAt !== undefined ? customer.deletedAt : undefined,
  }));
}

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") ?? "";

  const { permissions } = useAuth();

  const canManage = useMemo(
    () => permissions.includes(PERMISSION_MANAGE),
    [permissions]
  );
  const canCreate = useMemo(
    () => canManage || permissions.includes(PERMISSION_CREATE),
    [canManage, permissions]
  );
  const canUpdate = useMemo(
    () => canManage || permissions.includes(PERMISSION_UPDATE),
    [canManage, permissions]
  );
  const canDelete = useMemo(
    () => canManage || permissions.includes(PERMISSION_DELETE),
    [canManage, permissions]
  );
  const canRead = useMemo(
    () => canManage || permissions.includes(PERMISSION_READ),
    [canManage, permissions]
  );

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerListItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] =
    useState<CustomerListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshCustomers = useCallback(
    async (query?: string) => {
      if (!canRead) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = query
          ? await searchCustomers(query)
          : await getAllCustomers();
        setCustomers(mapCustomersResponse(response));
        setError(null);
      } catch {
        setError("Error al cargar clientes.");
      } finally {
        setLoading(false);
      }
    },
    [canRead]
  );

  useEffect(() => {
    setSearchQuery(initialQuery);
    refreshCustomers(initialQuery);
  }, [initialQuery, refreshCustomers]);

  const handleBack = () => {
    router.push("/admin");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    refreshCustomers(query);

    const route = query
      ? `/customers?q=${encodeURIComponent(query)}`
      : "/customers";
    router.replace(route);
  };

  const handleCreateClick = () => {
    if (!canCreate) {
      return;
    }
    setFormMode("create");
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: CustomerListItem) => {
    if (!canUpdate) {
      return;
    }
    setFormMode("edit");
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleFormSuccess = async () => {
    await refreshCustomers(searchQuery);
    setIsFormOpen(false);
    setSelectedCustomer(null);
    setFormMode("create");
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedCustomer(null);
      setFormMode("create");
    }
  };

  const handleDeleteRequest = (customer: CustomerListItem) => {
    if (!canDelete) {
      return;
    }
    setCustomerToDelete(customer);
    setIsDeleteOpen(true);
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setIsDeleteOpen(open);
    if (!open) {
      setCustomerToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) {
      return;
    }

    if (!canDelete) {
      setError("No tienes permisos para eliminar clientes.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete.id);
      await refreshCustomers(searchQuery);
      handleDeleteDialogChange(false);
    } catch {
      setError("Error al eliminar el cliente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto p-6">
        <CustomersHeader
          canCreate={canCreate}
          onBack={handleBack}
          onCreateClick={handleCreateClick}
        />
        <CustomersSearchBar
          initialQuery={initialQuery}
          onSearch={handleSearch}
          disabled={!canRead}
        />
        <CustomersTable
          customers={customers}
          loading={loading}
          error={error}
          canRead={canRead}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteRequest}
        />
      </div>
      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        mode={formMode}
        customer={selectedCustomer}
        onSuccess={handleFormSuccess}
      />
      <CustomerDeleteDialog
        open={isDeleteOpen}
        onOpenChange={handleDeleteDialogChange}
        customer={customerToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
}




