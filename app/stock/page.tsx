"use client";

import InventoryModule from "@/components/features/inventory/inventory-module";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductsAction } from "@/lib/actions/productActions";
import { useAuth } from "@/components/auth/auth-provider";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const PERMISSION_CREATE = "products:create";
const PERMISSION_READ = "products:read";
const PERMISSION_UPDATE = "products:update";
const PERMISSION_DELETE = "products:delete";
const PERMISSION_MANAGE = "products:manage";

export default function StockPage() {
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (!canRead) {
      setProducts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const result = await getProductsAction();
      setProducts(Array.isArray(result) ? (result as Product[]) : []);
      setError(null);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Error al cargar productos.");
    } finally {
      setLoading(false);
    }
  }, [canRead]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <DashboardLayout>
      <div className="mx-auto p-6 space-y-4">
        {error && canRead && (
          <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Cargando productos...
          </div>
        ) : (
          <InventoryModule
            initialProducts={products}
            canCreate={canCreate}
            canRead={canRead}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
