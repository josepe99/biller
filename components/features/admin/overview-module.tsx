"use client"

import { Settings, Users, Tag, BarChart } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent } from '@/components/ui/card'

interface OverviewModuleProps {
  onSelect: (module: 'settings' | 'users' | 'categories' | 'reports' | 'roles') => void
}

export default function OverviewModule({ onSelect }: OverviewModuleProps) {
  const { permissions } = useAuth();
  return (
    <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Configuración: ejemplo sin permiso específico */}
      <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => onSelect('settings')}>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Settings className="h-12 w-12 text-orange-500 mb-3" />
          <h3 className="text-lg font-semibold">Configuración</h3>
          <p className="text-sm text-muted-foreground">IVA, moneda, impresora.</p>
        </CardContent>
      </Card>

      {/* Usuarios: requiere users:manage */}
      {permissions.includes('users:manage') && (
        <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => onSelect('users')}>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Users className="h-12 w-12 text-orange-500 mb-3" />
            <h3 className="text-lg font-semibold">Usuarios</h3>
            <p className="text-sm text-muted-foreground">Gestionar roles (admin, cajero).</p>
          </CardContent>
        </Card>
      )}

      {/* Categorías: requiere categories:manage */}
      {permissions.includes('categories:manage') && (
        <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => onSelect('categories')}>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Tag className="h-12 w-12 text-orange-500 mb-3" />
            <h3 className="text-lg font-semibold">Categorías</h3>
            <p className="text-sm text-muted-foreground">Organizar productos.</p>
          </CardContent>
        </Card>
      )}

      {/* Roles: requiere roles:manage */}
      {permissions.includes('roles:manage') && (
        <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => onSelect('roles')}>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Users className="h-12 w-12 text-orange-500 mb-3" />
            <h3 className="text-lg font-semibold">Roles</h3>
            <p className="text-sm text-muted-foreground">Crear y editar roles de usuario.</p>
          </CardContent>
        </Card>
      )}

      {/* Reportes: requiere reports:view */}
      {permissions.includes('reports:view') && (
        <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => onSelect('reports')}>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <BarChart className="h-12 w-12 text-orange-500 mb-3" />
            <h3 className="text-lg font-semibold">Reportes</h3>
            <p className="text-sm text-muted-foreground">Ventas diarias/mensuales.</p>
          </CardContent>
        </Card>
      )}
    </CardContent>
  )
}
