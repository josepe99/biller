import { Receipt, User, UserCircle, FileText, Calendar, BadgeDollarSign, StickyNote, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getSaleBySaleNumber } from '@/lib/actions/saleActions';

// Helper to get before/next links
function getLink(currentSaleNumber: string, offset: number): string | null {
  const parts = currentSaleNumber.split('-');
  if (parts.length !== 3) return null;
  const prefix = parts[0] + '-' + parts[1] + '-';
  const last = parts[2];
  const num = Number(last);
  if (isNaN(num)) return null;
  const nextNum = num + offset;
  if (nextNum <= 0) return null;
  // Pad with leading zeros to match original length
  const nextStr = nextNum.toString().padStart(last.length, '0');
  return `/${prefix}${nextStr}`;
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function SaleDetailPage({ params }: { params: Promise<{ saleNumber: string }> }) {
  // Fetch sale by invoice number (adapt this to your actual data fetching logic)

  const paramsResolved = await params;
  const saleNumber = paramsResolved.saleNumber;
  const saleByInvoice = await getSaleBySaleNumber(saleNumber);
  if (!saleByInvoice) return notFound();

  const nextSaleNumber = getLink(saleNumber, 1)?.replace(/^\//, '');
  const beforeLink: string | undefined = getLink(saleNumber, -1)?.replace(/^\//, '');
  let nextLink: string | null = null;

  if (nextSaleNumber) {
    const nextSale = await getSaleBySaleNumber(nextSaleNumber);
    if (nextSale) nextLink = `/${nextSaleNumber}`;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* Header with back button and search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="icon" className="border-orange-200 text-orange-600 hover:bg-orange-50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="font-semibold text-lg text-orange-500">Detalle de Factura</span>
        </div>
        <div className="w-full md:w-80">
          <Input type="text" placeholder="Buscar..." className="w-full" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-0 md:p-6 border">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-4 mb-4">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Receipt className="text-orange-500 h-6 w-6" />
            <span className="text-2xl font-bold text-orange-500">Factura #{saleByInvoice.saleNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="h-5 w-5" />
            <span>{saleByInvoice.createdAt ? new Date(saleByInvoice.createdAt).toLocaleString() : '-'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="font-semibold">Cajero:</span>
              <span>{saleByInvoice.user?.name || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-gray-400" />
              <span className="font-semibold">Cliente:</span>
              <span>{saleByInvoice.customer?.name || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" />
              <span className="font-semibold">RUC Cliente:</span>
              <span>{saleByInvoice.customer?.ruc || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-gray-400" />
              <span className="font-semibold">Notas:</span>
              <span>{saleByInvoice.notes || '-'}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Subtotal:</span>
              <span>{saleByInvoice.subtotal?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">IVA:</span>
              <span>{saleByInvoice.tax?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold text-orange-500">
              <BadgeDollarSign className="h-6 w-6" />
              <span>Total:</span>
              <span>{saleByInvoice.total?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Estado:</span>
              <span className={
                saleByInvoice.status === 'COMPLETED'
                  ? 'text-green-600 font-semibold'
                  : 'text-gray-600 font-semibold'
              }>{saleByInvoice.status}</span>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <div className="font-semibold text-lg mb-2 text-gray-700">Items</div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Producto</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-600">Cantidad</th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-600">Precio Unitario</th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {saleByInvoice.saleItems?.map((item: any) => (
                  <tr key={item.id} className="border-t hover:bg-orange-50">
                    <td className="px-4 py-2">{item.product?.name || '-'}</td>
                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">{item.unitPrice?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}</td>
                    <td className="px-4 py-2 text-right">{item.total?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Navigation buttons at the bottom */}
      <div className="flex justify-between mt-10">
        {beforeLink ? (
          <Link href={beforeLink}>
            <Button variant="outline">Anterior</Button>
          </Link>
        ) : (
          <Button variant="outline" disabled>Anterior</Button>
        )}
        {nextLink ? (
          <Link href={nextLink}>
            <Button variant="outline">Siguiente</Button>
          </Link>
        ) : (
          <Button variant="outline" disabled>Siguiente</Button>
        )}
      </div>
    </div>
  );
}
