import AdminModule from '@/components/features/admin/admin-module'
import DashboardLayout from '@/components/layout/dashboard-layout'

export const dynamic = "force-dynamic"

export default function AdminPage() {
  return (
    <DashboardLayout>
      <AdminModule />
    </DashboardLayout>
  )
}
