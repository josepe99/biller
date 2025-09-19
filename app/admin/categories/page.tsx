import CategoryManagement from '@/components/features/admin/category-management'
import DashboardLayout from '@/components/layout/dashboard-layout'

export const dynamic = "force-dynamic";

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <CategoryManagement standalone={true} />
    </DashboardLayout>
  )
}