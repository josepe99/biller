import DashboardLayout from '@/components/layout/dashboard-layout'
import { getCheckoutByIdAction, getCheckoutTotalsAction } from '@/lib/actions/checkouts'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Props = {
  params: Promise<{ checkoutId: string }>
}

export default async function CheckoutDetailPage({ params }: Props) {
  const { checkoutId } = await params

  const [
    checkout,
    totalsRes
  ] = await Promise.all([
    getCheckoutByIdAction(checkoutId),
    getCheckoutTotalsAction(checkoutId)
  ]);

  const totals = totalsRes?.totals ?? {}
  const grandTotal = totalsRes?.grandTotal ?? 0

  return (
    <DashboardLayout>
      <div className="mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Detalle de Caja: {checkout?.name || checkoutId}</h1>
        <div className="mb-4 text-sm text-muted-foreground">
          {checkout?.description}
        </div>

        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white mb-3 me-3"
          size="sm"
        >
          Registrar Ingreso
        </Button>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white mb-3"
          size="sm"
        >
          Transferir
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2">Metadatos</h2>
            <dl className="text-sm">
              <div className="flex justify-between py-1"><dt>Creado</dt><dd>{checkout?.createdAt ? format(new Date(checkout.createdAt), 'dd/MM/yyyy HH:mm') : '-'}</dd></div>
              <div className="flex justify-between py-1"><dt>Actualizado</dt><dd>{checkout?.updatedAt ? format(new Date(checkout.updatedAt), 'dd/MM/yyyy HH:mm') : '-'}</dd></div>
              <div className="flex justify-between py-1"><dt>Ventas</dt><dd>{checkout?.sales?.length ?? '-'}</dd></div>
            </dl>
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2">Resumen total</h2>
            <div className="text-lg font-bold">{grandTotal.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 })}</div>
            <div className="mt-3 text-sm text-muted-foreground">Suma de todas las transacciones registradas para esta caja.</div>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Totales por método de pago</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Método</th>
                <th className="py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(totals).length === 0 ? (
                <tr><td colSpan={2} className="py-3 text-center text-muted-foreground">No se encontraron transacciones.</td></tr>
              ) : (
                Object.entries(totals).map(([k, v]) => (
                  <tr key={k} className="border-b last:border-0">
                    <td className="px-3 py-2 capitalize">{k.replace(/([A-Z])/g, ' $1')}</td>
                    <td className="px-3 py-2 text-right">{Number(v).toLocaleString('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
