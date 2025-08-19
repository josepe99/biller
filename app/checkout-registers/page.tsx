import { Badge } from '@/components/ui/badge';

// Simulación de datos de cajas
const mockRegisters = [
  { id: '1', nombre: 'Caja 1', estado: 'Abierta', openedAt: '2025-08-19 08:00', closedAt: null },
  { id: '2', nombre: 'Caja 2', estado: 'Cerrada', openedAt: '2025-08-18 09:00', closedAt: '2025-08-18 18:00' },
  { id: '3', nombre: 'Caja 3', estado: 'Cerrada', openedAt: '2025-08-17 10:00', closedAt: '2025-08-17 19:00' },
];

export default function CheckoutRegistersPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cierres de Cajas</h1>
      <div className="bg-white rounded shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Caja</th>
              <th className="py-2 text-left">Estado</th>
              <th className="py-2 text-left">Apertura</th>
              <th className="py-2 text-left">Cierre</th>
            </tr>
          </thead>
          <tbody>
            {mockRegisters.map(reg => (
              <tr key={reg.id} className="border-b last:border-0">
                <td className="py-2">{reg.nombre}</td>
                <td className="py-2">
                  {reg.estado === 'Abierta' ? (
                    <Badge variant="default">Abierta</Badge>
                  ) : (
                    <Badge variant="destructive">Cerrada</Badge>
                  )}
                </td>
                <td className="py-2">{reg.openedAt}</td>
                <td className="py-2">{reg.closedAt || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
