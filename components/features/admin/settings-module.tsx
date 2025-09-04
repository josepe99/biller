import { useAuth } from '@/components/auth/auth-provider'

interface SettingsModuleProps {
  onBack: () => void
}

export default function SettingsModule({ onBack }: SettingsModuleProps) {
  const { permissions } = useAuth()
  const canRead = permissions.includes('settings:manage') || permissions.includes('settings:read')

  if (!canRead) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <p className="text-muted-foreground">No tienes permiso para acceder a la configuración.</p>
        <button className="mt-4 text-orange-500 underline" onClick={onBack}>Volver</button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-orange-500">Configuración del Sistema</h2>
      <p className="text-muted-foreground mt-2">Aquí se gestionarán las configuraciones de IVA, moneda e impresora.</p>
      <button className="mt-4 text-orange-500 underline" onClick={onBack}>Volver</button>
    </div>
  )
}
