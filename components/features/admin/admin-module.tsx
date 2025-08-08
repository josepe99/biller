'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Users, Tag, BarChart } from 'lucide-react'
import { User, Category } from '@/lib/types'
import { sampleUsers, sampleCategories } from '@/lib/data/sample-data'
import UserManagement from './user-management'
import CategoryManagement from './category-management'

export default function AdminModule() {
  const [adminSubModule, setAdminSubModule] = useState<'overview' | 'users' | 'categories' | 'settings' | 'reports'>('overview')
  const [users, setUsers] = useState<User[]>(sampleUsers)
  const [categories, setCategories] = useState<Category[]>(sampleCategories)

  const renderAdminSubModule = () => {
    switch (adminSubModule) {
      case 'overview':
        return (
          <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => setAdminSubModule('settings')}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Settings className="h-12 w-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Configuración</h3>
                <p className="text-sm text-muted-foreground">IVA, moneda, impresora.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => setAdminSubModule('users')}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Users className="h-12 w-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Usuarios</h3>
                <p className="text-sm text-muted-foreground">Gestionar roles (admin, cajero).</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => setAdminSubModule('categories')}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Tag className="h-12 w-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Categorías</h3>
                <p className="text-sm text-muted-foreground">Organizar productos.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={() => setAdminSubModule('reports')}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <BarChart className="h-12 w-12 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold">Reportes</h3>
                <p className="text-sm text-muted-foreground">Ventas diarias/mensuales.</p>
              </CardContent>
            </Card>
          </CardContent>
        )
      case 'users':
        return <UserManagement users={users} setUsers={setUsers} onBack={() => setAdminSubModule('overview')} />
      case 'categories':
        return <CategoryManagement categories={categories} setCategories={setCategories} onBack={() => setAdminSubModule('overview')} />
      case 'settings':
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-orange-500">Configuración del Sistema</h2>
            <p className="text-muted-foreground mt-2">Aquí se gestionarán las configuraciones de IVA, moneda e impresora.</p>
          </div>
        )
      case 'reports':
        return (
          <div className="h-full flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-orange-500">Reportes de Ventas</h2>
            <p className="text-muted-foreground mt-2">Aquí se mostrarán los reportes de ventas diarias y mensuales.</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-orange-500">Panel de Administración</CardTitle>
      </CardHeader>
      {renderAdminSubModule()}
    </Card>
  )
}
