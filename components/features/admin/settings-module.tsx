'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings as SettingsIcon, Plus, Edit, Trash2, ArrowLeft, Eye, Save, X } from 'lucide-react'
import { Settings } from '@prisma/client'
import { getSettingsAction, createSettingsAction, updateSettingsAction, getSettingsByIdAction } from '@/lib/actions/settingActions'
import { toast } from '@/hooks/use-toast'

interface SettingsModuleProps {
  onBack: () => void
}

interface SettingsFormData {
  name: string
  values: string // JSON as string for editing
}

const PERMISSION_CREATE = "settings:create"
const PERMISSION_UPDATE = "settings:update"
const PERMISSION_READ = "settings:read"
const PERMISSION_MANAGE = "settings:manage"

export default function SettingsModule({ onBack }: SettingsModuleProps) {
  const { permissions } = useAuth()
  
  const canManage = permissions.includes(PERMISSION_MANAGE)
  const canCreate = canManage || permissions.includes(PERMISSION_CREATE)
  const canUpdate = canManage || permissions.includes(PERMISSION_UPDATE)
  const canRead = canManage || permissions.includes(PERMISSION_READ)

  const [settings, setSettings] = useState<Settings[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSettings, setEditingSettings] = useState<Settings | null>(null)
  const [formData, setFormData] = useState<SettingsFormData>({ name: '', values: '' })
  const [saving, setSaving] = useState(false)
  const [viewingSettings, setViewingSettings] = useState<Settings | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    if (!canRead) {
      setError("No tienes permisos para ver las configuraciones")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const result = await getSettingsAction()
      if (result.success && result.data) {
        setSettings(Array.isArray(result.data) ? result.data : [result.data])
      } else {
        setError(result.error || "Error al cargar configuraciones")
      }
    } catch (error) {
      setError("Error al cargar configuraciones")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    if (!canCreate) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para crear configuraciones",
        variant: "destructive"
      })
      return
    }
    
    setEditingSettings(null)
    setFormData({ name: '', values: '{}' })
    setIsDialogOpen(true)
  }

  const handleEdit = async (setting: Settings) => {
    if (!canUpdate) {
      toast({
        title: "Sin permisos", 
        description: "No tienes permisos para editar configuraciones",
        variant: "destructive"
      })
      return
    }

    setEditingSettings(setting)
    setFormData({
      name: setting.name,
      values: JSON.stringify(setting.values, null, 2)
    })
    setIsDialogOpen(true)
  }

  const handleView = (setting: Settings) => {
    setViewingSettings(setting)
    setIsViewDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate JSON
      let parsedValues
      try {
        parsedValues = JSON.parse(formData.values)
      } catch {
        toast({
          title: "Error de formato",
          description: "Los valores deben ser un JSON válido",
          variant: "destructive"
        })
        return
      }

      if (!formData.name.trim()) {
        toast({
          title: "Campo requerido",
          description: "El nombre es requerido",
          variant: "destructive"
        })
        return
      }

      const result = editingSettings 
        ? await updateSettingsAction(editingSettings.id, { 
            name: formData.name.trim(), 
            values: parsedValues 
          })
        : await createSettingsAction({ 
            name: formData.name.trim(), 
            values: parsedValues 
          })

      if (result.success) {
        toast({
          title: "Éxito",
          description: editingSettings ? "Configuración actualizada" : "Configuración creada",
        })
        setIsDialogOpen(false)
        loadSettings()
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al guardar la configuración",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar la configuración",
        variant: "destructive"
      })
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (!canRead) {
    return (
      <CardContent className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Sin permisos de acceso
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            No tienes permisos para ver las configuraciones del sistema.
          </p>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </CardContent>
    )
  }

  if (loading) {
    return (
      <CardContent className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando configuraciones...</p>
        </div>
      </CardContent>
    )
  }

  if (error) {
    return (
      <CardContent className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSettings}>
              Reintentar
            </Button>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </CardContent>
    )
  }

  return (
    <CardContent className="flex-grow flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-orange-500">
            Configuraciones del Sistema
          </h2>
        </div>
        {canCreate && (
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Configuración
          </Button>
        )}
      </div>

      {/* Settings List */}
      <div className="grid gap-4">
        {settings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay configuraciones creadas</p>
              {canCreate && (
                <Button className="mt-2" onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera configuración
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          settings.map((setting) => (
            <Card key={setting.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{setting.name}</h3>
                      <Badge variant="secondary">{typeof setting.values}</Badge>
                    </div>
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
                      onClick={() => handleView(setting)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(setting)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSettings ? 'Editar Configuración' : 'Nueva Configuración'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="values">Valores (JSON)</Label>
              <Textarea
                id="values"
                value={formData.values}
                onChange={(e) => setFormData(prev => ({ ...prev, values: e.target.value }))}
                placeholder='{"key": "value", "number": 123}'
                className="font-mono text-sm min-h-[200px]"
                disabled={saving}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ver Configuración: {viewingSettings?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={viewingSettings?.name || ''} disabled />
            </div>
            <div>
              <Label>Valores (JSON)</Label>
              <Textarea
                value={viewingSettings ? JSON.stringify(viewingSettings.values, null, 2) : ''}
                className="font-mono text-sm min-h-[200px]"
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Creado</Label>
                <p className="text-muted-foreground">
                  {viewingSettings && new Date(viewingSettings.createdAt).toLocaleString('es-PY')}
                </p>
              </div>
              <div>
                <Label>Actualizado</Label>
                <p className="text-muted-foreground">
                  {viewingSettings && new Date(viewingSettings.updatedAt).toLocaleString('es-PY')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CardContent>
  )
}
