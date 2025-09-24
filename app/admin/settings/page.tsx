"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings as SettingsIcon, Plus, Edit, Eye, Save, X, ArrowLeft } from "lucide-react";
import { Settings } from "@prisma/client";
import { getSettingsAction, createSettingsAction, updateSettingsAction } from "@/lib/actions/settingActions";
import { toast } from "@/hooks/use-toast";
import { SettingsHeader } from "@/components/features/admin/settings/settings-header";
import { SettingsTableSection } from "@/components/features/admin/settings/settings-table-section";
import { SettingsFormDialog } from "@/components/features/admin/settings/settings-form-dialog";
import { SettingsViewDialog } from "@/components/features/admin/settings/settings-view-dialog";

const PERMISSION_CREATE = "settings:create";
const PERMISSION_UPDATE = "settings:update";
const PERMISSION_READ = "settings:read";
const PERMISSION_MANAGE = "settings:manage";

export default function SettingsPage() {
  const router = useRouter();
  const { permissions } = useAuth();

  const canManage = permissions.includes(PERMISSION_MANAGE);
  const canCreate = canManage || permissions.includes(PERMISSION_CREATE);
  const canUpdate = canManage || permissions.includes(PERMISSION_UPDATE);
  const canRead = canManage || permissions.includes(PERMISSION_READ);

  const [settings, setSettings] = useState<Settings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingSettings, setEditingSettings] = useState<Settings | null>(null);
  const [viewingSettings, setViewingSettings] = useState<Settings | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [canRead]);

  const loadSettings = async () => {
    if (!canRead) {
      setError("No tienes permisos para ver las configuraciones");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getSettingsAction();
      if (result) {
        setSettings(Array.isArray(result) ? result : [result]);
        setError(null);
      } else {
        setError("Error al cargar configuraciones");
      }
    } catch (error) {
      setError("Error al cargar configuraciones");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/admin");
  };

  const handleFormDialogChange = (open: boolean) => {
    setIsFormDialogOpen(open);
    if (!open) {
      setEditingSettings(null);
    }
  };

  const handleViewDialogChange = (open: boolean) => {
    setIsViewDialogOpen(open);
    if (!open) {
      setViewingSettings(null);
    }
  };

  const handleCreateClick = () => {
    if (!canCreate) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para crear configuraciones",
        variant: "destructive"
      });
      return;
    }
    
    setEditingSettings(null);
    setIsFormDialogOpen(true);
  };

  const handleEditSettings = (setting: Settings) => {
    if (!canUpdate) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para editar configuraciones",
        variant: "destructive"
      });
      return;
    }

    setEditingSettings(setting);
    setIsFormDialogOpen(true);
  };

  const handleViewSettings = (setting: Settings) => {
    setViewingSettings(setting);
    setIsViewDialogOpen(true);
  };

  const handleSubmitSettings = async (data: { name: string; description?: string; values: any }) => {
    setError(null);
    try {
      const result = editingSettings
        ? await updateSettingsAction(editingSettings.id, data)
        : await createSettingsAction(data);

      if (result) {
        toast({
          title: "Éxito",
          description: editingSettings ? "Configuración actualizada" : "Configuración creada",
        });
        setIsFormDialogOpen(false);
        loadSettings();
      } else {
        toast({
          title: "Error",
          description: "Error al guardar la configuración",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar la configuración",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  if (!canRead) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-orange-500">Configuraciones del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center">
          <div className="text-center">
            <SettingsIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Sin permisos de acceso
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              No tienes permisos para ver las configuraciones del sistema.
            </p>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Panel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <SettingsHeader
        canCreate={canCreate}
        onBack={handleBack}
        onCreateClick={handleCreateClick}
      />

      <SettingsTableSection
        settings={settings}
        loading={loading}
        error={error}
        canRead={canRead}
        canUpdate={canUpdate}
        onView={handleViewSettings}
        onEdit={handleEditSettings}
        onRetry={loadSettings}
        emptyState={{
          title: "No hay configuraciones creadas",
          description: "Comienza creando tu primera configuración del sistema",
          action: canCreate ? (
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primera configuración
            </Button>
          ) : undefined
        }}
      />

      {/* Form Dialog */}
      <SettingsFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => handleFormDialogChange(false)}
        editingSettings={editingSettings}
        onSubmit={handleSubmitSettings}
      />

      {/* View Dialog */}
      <SettingsViewDialog
        isOpen={isViewDialogOpen}
        onClose={() => handleViewDialogChange(false)}
        settings={viewingSettings}
      />
    </Card>
  );
}