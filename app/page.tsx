import BillingModule from '@/components/features/billing/billing-module'
import DashboardLayout from '@/components/layout/dashboard-layout'

export default function HomePage() {
  return (
    <DashboardLayout>
      <BillingModule />
    </DashboardLayout>
  )
}
