import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "@prisma/client";

interface SettingsViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings | null;
}

export function SettingsViewDialog({
  isOpen,
  onClose,
  settings
}: SettingsViewDialogProps) {
  if (!settings) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ver Configuración: {settings.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input value={settings.name} disabled />
          </div>
          <div>
            <Label>Descripción</Label>
            <Input value={settings.description || 'Sin descripción'} disabled />
          </div>
          <div>
            <Label>Valores (JSON)</Label>
            <Textarea
              value={JSON.stringify(settings.values, null, 2)}
              className="font-mono text-sm min-h-[300px]"
              disabled
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label>Creado</Label>
              <p className="text-muted-foreground">
                {new Date(settings.createdAt).toLocaleString('es-PY')}
              </p>
            </div>
            <div>
              <Label>Actualizado</Label>
              <p className="text-muted-foreground">
                {new Date(settings.updatedAt).toLocaleString('es-PY')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}