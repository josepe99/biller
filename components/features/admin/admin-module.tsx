'use client'

import { sampleUsers, sampleCategories } from '@/lib/data/sample-data'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/auth/auth-provider'
import CategoryManagement from './category-management'
import UserManagement from './user-management'
import OverviewModule from './overview-module'
import SettingsModule from './settings-module'
import RoleManagement from './role-management'
import ReportsModule from './reports-module'
import { User, Category } from '@prisma/client'
import { useState } from 'react'

export default function AdminModule() {
  const { permissions = [] } = useAuth();
  const [adminSubModule, setAdminSubModule] = useState<'overview' | 'users' | 'categories' | 'settings' | 'reports' | 'roles'>('overview')
  const [users, setUsers] = useState<User[]>(sampleUsers)
  const [categories, setCategories] = useState<Category[]>(sampleCategories)



  const renderAdminSubModule = () => {
    switch (adminSubModule) {
      case 'overview':
        return <OverviewModule onSelect={setAdminSubModule as (m: 'users'|'categories'|'settings'|'reports'|'roles'|'checkouts') => void} />
      case 'users':
        return permissions.includes('users:manage')
          ? <UserManagement onBack={() => setAdminSubModule('overview')} />
          : <div className="p-4 text-center text-muted-foreground">No tienes permiso para ver esta sección.</div>
      case 'categories':
        return permissions.includes('categories:manage')
          ? <CategoryManagement onBack={() => setAdminSubModule('overview')} />
          : <div className="p-4 text-center text-muted-foreground">No tienes permiso para ver esta sección.</div>
      case 'roles':
        return permissions.includes('roles:manage')
          ? <RoleManagement onBack={() => setAdminSubModule('overview')} />
          : <div className="p-4 text-center text-muted-foreground">No tienes permiso para ver esta sección.</div>
      case 'settings':
        return (permissions.includes('settings:manage') || permissions.includes('settings:read'))
          ? <SettingsModule onBack={() => setAdminSubModule('overview')} />
          : <div className="p-4 text-center text-muted-foreground">No tienes permiso para ver esta sección.</div>
      case 'reports':
        return permissions.includes('reports:view')
          ? <ReportsModule onBack={() => setAdminSubModule('overview')} />
          : <div className="p-4 text-center text-muted-foreground">No tienes permiso para ver esta sección.</div>
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
