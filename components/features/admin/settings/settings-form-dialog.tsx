"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, X } from "lucide-react";
import { Settings } from "@prisma/client";
import { toast } from "@/hooks/use-toast";
import { JsonCodeEditor } from "./json-code-editor";

interface SettingsFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingSettings: Settings | null;
  onSubmit: (data: { name: string; description?: string; values: any }) => Promise<void>;
}

interface FormData {
  name: string;
  description: string;
  values: string; // JSON as string for editing
}

export function SettingsFormDialog({
  isOpen,
  onClose,
  editingSettings,
  onSubmit
}: SettingsFormDialogProps) {
  const [formData, setFormData] = useState<FormData>({ name: '', description: '', values: '' });
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string>('');

  // Initialize form data when dialog opens or editingSettings changes
  useEffect(() => {
    if (isOpen) {
      if (editingSettings) {
        setFormData({
          name: editingSettings.name,
          description: editingSettings.description || '',
          values: JSON.stringify(editingSettings.values, null, 2)
        });
      } else {
        setFormData({
          name: '',
          description: '',
          values: '{\n  \n}'
        });
      }
      setJsonError('');
    }
  }, [isOpen, editingSettings]);

  const validateJson = (jsonString: string): { isValid: boolean; parsed?: any; error?: string } => {
    if (!jsonString.trim()) {
      return { isValid: false, error: 'El JSON no puede estar vacío' };
    }

    try {
      const parsed = JSON.parse(jsonString);
      return { isValid: true, parsed };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'JSON inválido' 
      };
    }
  };

  const handleJsonChange = (value: string) => {
    setFormData(prev => ({ ...prev, values: value }));
    
    // Validate JSON in real-time
    const validation = validateJson(value);
    setJsonError(validation.error || '');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Campo requerido",
        description: "El nombre es requerido",
        variant: "destructive"
      });
      return;
    }

    const validation = validateJson(formData.values);
    if (!validation.isValid) {
      toast({
        title: "Error de formato",
        description: validation.error || "El JSON no es válido",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        values: validation.parsed
      });
    } catch (error) {
      // Error handling is done in parent component
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingSettings ? 'Editar Configuración' : 'Nueva Configuración'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 space-y-4 overflow-hidden">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: theme_config, payment_settings"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el propósito de esta configuración"
              disabled={saving}
            />
          </div>
          
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <Label>Valores (JSON)</Label>
              {jsonError && (
                <span className="text-sm text-destructive">{jsonError}</span>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <JsonCodeEditor
                value={formData.values}
                onChange={handleJsonChange}
                disabled={saving}
                error={jsonError}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving || !!jsonError}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {editingSettings ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}