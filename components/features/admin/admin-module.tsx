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
        return <UserManagement onBack={() => setAdminSubModule('overview')} />
      case 'categories':
        return <CategoryManagement onBack={() => setAdminSubModule('overview')} />
      case 'roles':
        return <RoleManagement onBack={() => setAdminSubModule('overview')} />
      case 'settings':
        return <SettingsModule onBack={() => setAdminSubModule('overview')} />
      case 'reports':
        return <ReportsModule onBack={() => setAdminSubModule('overview')} />
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
