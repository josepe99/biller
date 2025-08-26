"use client"

import DashboardLayout from '@/components/layout/dashboard-layout'
import CheckoutManagement from '@/components/features/admin/checkout-management'

export default function AdminCheckoutsPage() {
  return (
    <DashboardLayout>
      <CheckoutManagement />
    </DashboardLayout>
  )
}
