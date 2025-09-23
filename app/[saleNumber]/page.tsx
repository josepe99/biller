import { notFound } from 'next/navigation';
import { getSaleBySaleNumber } from '@/lib/actions/saleActions';
import { getSaleNavigationLink } from '@/lib/utils/sale-navigation';
import { SaleDetailClient } from '@/components/features/sales/SaleDetailClient';

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
    <SaleDetailClient
      initialSale={saleByInvoice}
      saleNumber={saleNumber}
      beforeLink={beforeLink}
      nextLink={nextLink}
    />
  );
}
