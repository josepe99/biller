'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Users, Tag, BarChart } from 'lucide-react'

import { User, Category } from '@/lib/types'
import { sampleUsers, sampleCategories } from '@/lib/data/sample-data'
import UserManagement from './user-management'
import CategoryManagement from './category-management'
import OverviewModule from './overview-module'
import SettingsModule from './settings-module'
import ReportsModule from './reports-module'

export default function AdminModule() {
  const [adminSubModule, setAdminSubModule] = useState<'overview' | 'users' | 'categories' | 'settings' | 'reports'>('overview')
  const [users, setUsers] = useState<User[]>(sampleUsers)
  const [categories, setCategories] = useState<Category[]>(sampleCategories)


  const renderAdminSubModule = () => {
    switch (adminSubModule) {
      case 'overview':
        return <OverviewModule onSelect={setAdminSubModule} />
      case 'users':
        return <UserManagement users={users} setUsers={setUsers} onBack={() => setAdminSubModule('overview')} />
      case 'categories':
        return <CategoryManagement categories={categories} setCategories={setCategories} onBack={() => setAdminSubModule('overview')} />
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
