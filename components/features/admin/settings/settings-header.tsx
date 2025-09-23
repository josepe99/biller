import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";

interface SettingsHeaderProps {
  canCreate: boolean;
  onBack: () => void;
  onCreateClick: () => void;
}

export function SettingsHeader({
  canCreate,
  onBack,
  onCreateClick
}: SettingsHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-orange-500">
            Configuraciones del Sistema
          </CardTitle>
        </div>
        {canCreate && (
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Configuración
          </Button>
        )}
      </div>
    </CardHeader>
  );
}