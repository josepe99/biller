export const dynamic = "force-dynamic";
import InventoryModule from '@/components/features/inventory/inventory-module'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { getProductsAction } from '@/lib/actions/productActions';

export default async function StockPage() {
  const products = await getProductsAction();

  return (
    <DashboardLayout>
      <InventoryModule initialProducts={products} />
    </DashboardLayout>
  )
}
