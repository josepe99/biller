import BillingModule from '@/components/features/billing/billing-module'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { getSaleBySaleNumber } from '@/lib/actions/saleActions'
import { isValidInvoiceNumber } from '@/lib/utils/invoice-generator'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Await searchParams directly
  const resolvedSearchParams = await searchParams;
  const saleNumber = Array.isArray(resolvedSearchParams.numeroFactura)
    ? resolvedSearchParams.numeroFactura[0]
    : resolvedSearchParams.numeroFactura;
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
