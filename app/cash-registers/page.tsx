import { getAllCashRegisters } from "@/lib/actions/cashRegisterActions";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";

export default async function CheckoutRegistersPage() {
  const activeCashRegisters = await getAllCashRegisters();

  return (
    <DashboardLayout>
      <div className="mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">
          Historial de Aperturas y Cierres de Cajas
        </h1>
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
              {activeCashRegisters.map((reg) => {
                const href = `/cash-registers/${reg.id}`;
                return (
                  <tr
                    key={reg.id}
                    className="group border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="p-0">
                      <Link
                        href={href}
                        className="block px-3 py-2 w-full h-full"
                      >
                        {reg.checkout?.name || "-"}
                      </Link>
                    </td>

                    <td className="p-0">
                      <Link
                        href={href}
                        className="block px-3 py-2 w-full h-full"
                      >
                        {reg.status === "OPEN" ? (
                          <Badge variant="default">Abierta</Badge>
                        ) : (
                          <Badge variant="destructive">Cerrada</Badge>
                        )}
                      </Link>
                    </td>

                    <td className="p-0">
                      <Link
                        href={href}
                        className="block px-3 py-2 w-full h-full"
                      >
                        {reg.openedAt
                          ? format(new Date(reg.openedAt), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </Link>
                    </td>

                    <td className="p-0">
                      <Link
                        href={href}
                        className="block px-3 py-2 w-full h-full"
                      >
                        {typeof reg.initialCash === "number"
                          ? reg.initialCash.toLocaleString("es-PY", {
                              style: "currency",
                              currency: "PYG",
                              maximumFractionDigits: 0,
                            })
                          : "-"}
                      </Link>
                    </td>

                    <td className="p-0">
                      <Link
                        href={href}
                        className="block px-3 py-2 w-full h-full"
                      >
                        {reg.closedAt
                          ? format(new Date(reg.closedAt), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </Link>
                    </td>

                    <td className="p-0">
                      <Link
                        href={href}
                        className="block px-3 py-2 w-full h-full"
                      >
                        {typeof reg.finalCash === "number"
                          ? reg.finalCash.toLocaleString("es-PY", {
                              style: "currency",
                              currency: "PYG",
                              maximumFractionDigits: 0,
                            })
                          : "-"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
