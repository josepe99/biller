"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface SaleDetailWrapperProps {
  children: React.ReactNode;
  requireUpdate?: boolean; // Si se requiere permiso de actualización
}

export function SaleDetailWrapper({ children, requireUpdate = false }: SaleDetailWrapperProps) {
  const { permissions, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const hasReadPermission = permissions.includes("sales:read") || permissions.includes("sales:manage");
  const hasUpdatePermission = permissions.includes("sales:update") || permissions.includes("sales:manage");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isLoading && isAuthenticated && !hasReadPermission) {
      router.push("/unauthorized");
      return;
    }
  }, [isLoading, isAuthenticated, hasReadPermission, router]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verificando permisos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !hasReadPermission) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acceso denegado</h3>
              <p className="text-muted-foreground">
                No tienes permisos para ver los detalles de las facturas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {children}
      {/* Pasar información de permisos al contexto */}
      <div style={{ display: 'none' }} data-can-update={hasUpdatePermission} />
    </div>
  );
}

// Hook personalizado para verificar permisos en componentes hijos
export function useSalePermissions() {
  const { permissions } = useAuth();
  
  return {
    canRead: permissions.includes("sales:read") || permissions.includes("sales:manage"),
    canUpdate: permissions.includes("sales:update") || permissions.includes("sales:manage"),
  };
}