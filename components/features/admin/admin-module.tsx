'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import OverviewModule from './overview-module'
import ReportsModule from './reports-module'
import { useState } from 'react'

export default function AdminModule() {
  const [adminSubModule, setAdminSubModule] = useState<'overview' | 'reports'>('overview')

  const renderAdminSubModule = () => {
    switch (adminSubModule) {
      case 'overview':
        return <OverviewModule onSelect={setAdminSubModule} />
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
