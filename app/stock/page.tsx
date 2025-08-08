import InventoryModule from '@/components/features/inventory/inventory-module'
import DashboardLayout from '@/components/layout/dashboard-layout'

export default function StockPage() {
  return (
    <DashboardLayout>
      <InventoryModule />
    </DashboardLayout>
  )
}
