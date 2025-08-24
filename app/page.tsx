import BillingModule from '@/components/features/billing/billing-module'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { getSaleBySaleNumber } from '@/lib/actions/saleActions'
import { isValidInvoiceNumber } from '@/lib/utils/invoice-generator'

export default async function HomePage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const saleNumber = Array.isArray(searchParams.numeroFactura)
    ? searchParams.numeroFactura[0]
    : searchParams.numeroFactura;
  const salePromise = saleNumber && isValidInvoiceNumber(saleNumber)
    ? getSaleBySaleNumber(saleNumber)
    : Promise.resolve(null);
  let saleByInvoice = null;
  try {
    saleByInvoice = await salePromise;
  } catch (e) {
    saleByInvoice = null;
  }

  return (
    <DashboardLayout>
      <BillingModule saleByInvoice={saleByInvoice} />
    </DashboardLayout>
  );
}
