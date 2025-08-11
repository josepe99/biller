import InventoryModule from '@/components/features/inventory/inventory-module'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { getProductsAction } from '@/lib/actions/products';

export default async function StockPage() {
  const products = await getProductsAction();
  console.log(products);
  return (
    <DashboardLayout>
      <InventoryModule initialProducts={products} />
    </DashboardLayout>
  )
}
