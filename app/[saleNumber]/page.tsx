import { notFound } from 'next/navigation';
import { getSaleBySaleNumber } from '@/lib/actions/saleActions';
import { getSaleNavigationLink } from '@/lib/utils/sale-navigation';
import {
  SaleDetailHeader,
  SaleInvoiceHeader,
  SaleDetails,
  SaleSummary,
  SaleItemsTable,
  SaleNavigation
} from '@/components/features/sales';

export default async function SaleDetailPage({ params }: { params: Promise<{ saleNumber: string }> }) {
  const paramsResolved = await params;
  const saleNumber = paramsResolved.saleNumber;
  const saleByInvoice = await getSaleBySaleNumber(saleNumber);
  if (!saleByInvoice) return notFound();

  const nextSaleNumber = getSaleNavigationLink(saleNumber, 1)?.replace(/^\//, '');
  const beforeLink: string | undefined = getSaleNavigationLink(saleNumber, -1)?.replace(/^\//, '');
  let nextLink: string | null = null;

  if (nextSaleNumber) {
    const nextSale = await getSaleBySaleNumber(nextSaleNumber);
    if (nextSale) nextLink = `/${nextSaleNumber}`;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <SaleDetailHeader />

      <div className="bg-white rounded-lg shadow p-0 md:p-6 border">
        <SaleInvoiceHeader
          saleNumber={saleByInvoice.saleNumber}
          createdAt={saleByInvoice.createdAt}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SaleDetails
            cashierName={saleByInvoice.user?.name}
            customerName={saleByInvoice.customer?.name}
            customerRuc={saleByInvoice.customer?.ruc}
            notes={saleByInvoice.notes}
          />

          <SaleSummary
            subtotal={saleByInvoice.subtotal}
            tax={saleByInvoice.tax}
            total={saleByInvoice.total}
            status={saleByInvoice.status}
          />
        </div>

        <SaleItemsTable items={saleByInvoice.saleItems} />
      </div>

      <SaleNavigation
        beforeLink={beforeLink}
        nextLink={nextLink}
      />
    </div>
  );
}
