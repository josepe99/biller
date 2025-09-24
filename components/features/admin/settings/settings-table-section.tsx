import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Eye, Edit, ArrowLeft } from "lucide-react";
import { Settings as SettingsType } from "@prisma/client";

interface SettingsTableSectionProps {
  settings: SettingsType[];
  loading: boolean;
  error: string | null;
  canRead: boolean;
  canUpdate: boolean;
  onView: (setting: SettingsType) => void;
  onEdit: (setting: SettingsType) => void;
  onRetry: () => void;
  emptyState: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
}

export function SettingsTableSection({
  settings,
  loading,
  error,
  canRead,
  canUpdate,
  onView,
  onEdit,
  onRetry,
  emptyState
}: SettingsTableSectionProps) {
  if (loading) {
    return (
      <CardContent className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando configuraciones...</p>
        </div>
      </CardContent>
    );
  }

  if (error) {
    return (
      <CardContent className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      </CardContent>
    );
  }

  if (!canRead) {
    return (
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground">
          No tienes permiso para ver las configuraciones.
        </div>
      </CardContent>
    );
  }

  if (settings.length === 0) {
    return (
      <CardContent className="flex-grow">
        <Card>
          <CardContent className="py-8 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">{emptyState.title}</h3>
            <p className="text-muted-foreground mb-4">{emptyState.description}</p>
            {emptyState.action}
          </CardContent>
        </Card>
      </CardContent>
    );
  }

  return (
    <CardContent className="flex-grow">
      <div className="space-y-4">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{setting.name}</h3>
                    <Badge variant="secondary">
                      {Array.isArray(setting.values) ? 'array' : typeof setting.values}
                    </Badge>
                  </div>
                  {setting.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {setting.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Creado: {new Date(setting.createdAt).toLocaleDateString('es-PY')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Actualizado: {new Date(setting.updatedAt).toLocaleDateString('es-PY')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(setting)}
                    title="Ver configuración"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canUpdate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(setting)}
                      title="Editar configuración"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  );
}