import { getAllCashRegisters } from '@/lib/actions/cashRegisterActions';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';


export default async function CheckoutRegistersPage() {
  const activeCashRegisters = await getAllCashRegisters()

  return (
    <DashboardLayout>
      <div className="mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Historial de Aperturas y Cierres de Cajas</h1>
        <div className="bg-white rounded shadow p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Caja</th>
                <th className="py-2 text-left">Estado</th>
                <th className="py-2 text-left">Apertura</th>
                <th className="py-2 text-left">Dinero Inicial</th>
                <th className="py-2 text-left">Cierre</th>
                <th className="py-2 text-left">Dinero al Cerrar</th>
              </tr>
            </thead>
            <tbody>
              {activeCashRegisters.map(reg => (
                <tr key={reg.id} className="border-b last:border-0">
                  <td className="py-2">{reg.checkout?.name || '-'}</td>
                  <td className="py-2">
                    {reg.status === 'OPEN' ? (
                      <Badge variant="default">Abierta</Badge>
                    ) : (
                      <Badge variant="destructive">Cerrada</Badge>
                    )}
                  </td>
                  <td className="py-2">
                    {reg.openedAt ? format(new Date(reg.openedAt), 'dd/MM/yyyy HH:mm') : '-'}
                  </td>
                  <td className="py-2">
                    {typeof reg.initialCash === 'number' ? reg.initialCash.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }) : '-'}
                  </td>
                  <td className="py-2">
                    {reg.closedAt ? format(new Date(reg.closedAt), 'dd/MM/yyyy HH:mm') : '-'}
                  </td>
                  <td className="py-2">
                    {typeof reg.finalCash === 'number' ? reg.finalCash.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
