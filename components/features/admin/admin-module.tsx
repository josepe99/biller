'use client'

import { sampleUsers, sampleCategories } from '@/lib/data/sample-data'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/auth/auth-provider'
import OverviewModule from './overview-module'
import SettingsModule from './settings-module'
import ReportsModule from './reports-module'
import { User, Category } from '@prisma/client'
import { useState } from 'react'

export default function AdminModule() {
  const [adminSubModule, setAdminSubModule] = useState<'overview' | 'settings' | 'reports'>('overview')

  const renderAdminSubModule = () => {
    switch (adminSubModule) {
      case 'overview':
        return <OverviewModule onSelect={setAdminSubModule} />
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
