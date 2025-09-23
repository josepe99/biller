"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
import { SaleEditModal } from '@/components/features/sales/SaleEditModal';
import { SaleDetailWrapper } from '@/components/auth/sale-detail-wrapper';
import { Card, CardContent } from '@/components/ui/card';

interface Sale {
  id: string;
  saleNumber: string;
  createdAt: Date;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  notes?: string | null;
  user?: { name: string } | null;
  customer?: { name: string; ruc: string | null } | null;
  saleItems: any[];
}

interface SaleDetailClientProps {
  initialSale: Sale;
  saleNumber: string;
  beforeLink?: string;
  nextLink?: string | null;
}

export function SaleDetailClient({ initialSale, saleNumber, beforeLink, nextLink }: SaleDetailClientProps) {
  const router = useRouter();
  const [sale, setSale] = useState<Sale>(initialSale);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const updatedSale = await getSaleBySaleNumber(saleNumber);
      if (updatedSale) {
        setSale(updatedSale);
      }
      // Refresh the page to ensure all data is up to date
      router.refresh();
    } catch (error) {
      console.error('Error refreshing sale data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SaleDetailWrapper>
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Actualizando datos de la factura...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SaleDetailWrapper>
    );
  }

  return (
    <SaleDetailWrapper>
      <div className="max-w-4xl mx-auto mt-8">
        <SaleDetailHeader />

        <div className="bg-white rounded-lg shadow p-0 md:p-6 border">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <SaleInvoiceHeader
                saleNumber={sale.saleNumber}
                createdAt={sale.createdAt}
              />
            </div>
            <div className="ml-4">
              <SaleEditModal
                saleId={sale.id}
                saleNumber={sale.saleNumber}
                currentStatus={sale.status}
                currentNotes={sale.notes}
                onUpdate={handleUpdate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SaleDetails
              cashierName={sale.user?.name}
              customerName={sale.customer?.name}
              customerRuc={sale.customer?.ruc}
              notes={sale.notes}
            />

            <SaleSummary
              subtotal={sale.subtotal}
              tax={sale.tax}
              total={sale.total}
              status={sale.status}
            />
          </div>

          <SaleItemsTable items={sale.saleItems} />
        </div>

        <SaleNavigation
          beforeLink={beforeLink}
          nextLink={nextLink}
        />
      </div>
    </SaleDetailWrapper>
  );
}