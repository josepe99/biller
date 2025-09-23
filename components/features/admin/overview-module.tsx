"use client"

import { Settings, Users, Tag, BarChart, DollarSign, Receipt, FileText } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface OverviewModuleProps {
  onSelect: (module: 'settings' | 'reports') => void
}

export default function OverviewModule({ onSelect }: OverviewModuleProps) {
  const { permissions } = useAuth();
  return (
    <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Configuración: ejemplo sin permiso específico */}
      <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer h-56" onClick={() => onSelect('settings')}>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Settings className="h-12 w-12 text-orange-500 mb-3" />
          <h3 className="text-lg font-semibold">Configuración</h3>
          <p className="text-sm text-muted-foreground">IVA, moneda, impresora.</p>
        </CardContent>
      </Card>

      {/* Usuarios: requiere users:manage */}
      {permissions.includes('users:manage') && (
        <Link href="/admin/users">
          <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer h-56">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Users className="h-12 w-12 text-orange-500 mb-3" />
              <h3 className="text-lg font-semibold">Usuarios</h3>
              <p className="text-sm text-muted-foreground">Gestionar roles (admin, cajero).</p>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Categorías: requiere categories:manage */}
      {permissions.includes('categories:manage') && (
        <Link href="/admin/categories">
          <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer h-56">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Tag className="h-12 w-12 text-orange-500 mb-3" />
              <h3 className="text-lg font-semibold">Categorías</h3>
              <p className="text-sm text-muted-foreground">Organizar productos.</p>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Roles: requiere roles:manage */}
      {permissions.includes('roles:manage') && (
        <Link href="/admin/roles">
          <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer h-56">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Users className="h-12 w-12 text-orange-500 mb-3" />
              <h3 className="text-lg font-semibold">Roles</h3>
              <p className="text-sm text-muted-foreground">Crear y editar roles de usuario.</p>
            </CardContent>
          </Card>
        </Link>
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

      {/* Facturas: requiere sales:read o sales:manage */}
      {(permissions.includes('sales:manage') || permissions.includes('sales:read')) && (
        <Link href="/admin/invoices">
          <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer h-56">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <FileText className="h-12 w-12 text-orange-500 mb-3" />
              <h3 className="text-lg font-semibold">Facturas</h3>
              <p className="text-sm text-muted-foreground">Historial de ventas y comprobantes.</p>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Notas de crédito: requiere creditNotes:read o creditNotes:manage */}
      {(permissions.includes('creditNotes:manage') || permissions.includes('creditNotes:read')) && (
        <Link href="/admin/credit-notes">
          <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer h-56">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Receipt className="h-12 w-12 text-orange-500 mb-3" />
              <h3 className="text-lg font-semibold">Notas de crédito</h3>
              <p className="text-sm text-muted-foreground">Gestionar devoluciones y ajustes.</p>
            </CardContent>
          </Card>
        </Link>
      )}
      {/* Cajas: requiere cashRegister:read o cashRegister:manage */}
      {(permissions.includes('cashRegister:manage') || permissions.includes('cashRegister:read')) && (
        <Link href="/admin/checkouts">
          <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer h-56">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <DollarSign className="h-12 w-12 text-orange-500 mb-3" />
              <h3 className="text-lg font-semibold">Cajas</h3>
              <p className="text-sm text-muted-foreground">Administrar cajas y turnos.</p>
            </CardContent>
          </Card>
        </Link>
      )}
    </CardContent>
  )
}
