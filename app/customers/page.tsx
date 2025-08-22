import CustomerForm from '@/components/features/admin/customer-form';
import CustomerEditCell from '@/components/features/admin/customer-edit-cell';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { getAllCustomers } from '@/lib/actions/customerActions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Customer } from '@prisma/client';


export default async function CustomersPage() {
  const customers: Customer[] = await getAllCustomers();

  return (
    <DashboardLayout>
      <div className="mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Clientes</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" className="ml-4">Agregar Cliente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Cliente</DialogTitle>
              </DialogHeader>
              <CustomerForm />
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-white rounded shadow p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">RUC</th>
                <th className="py-2 text-left">Nombre</th>
                <th className="py-2 text-left">Email</th>
                <th className="py-2 text-left">Fecha de Registro</th>
                <th className="py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id} className="border-b last:border-0">
                  <td className="py-2">{customer.ruc || '-'}</td>
                  <td className="py-2">{customer.name}</td>
                  <td className="py-2">{customer.email}</td>
                  <td className="py-2">{new Date(customer.createdAt).toLocaleDateString('es-PY')}</td>
                  <td className="py-2">
                    <CustomerEditCell customer={customer} />
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
