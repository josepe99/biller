"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';
import { createCustomer, updateCustomer } from '@/lib/actions/customerActions';


type CustomerFormProps = {
  initialData?: any;
  mode?: 'edit' | 'create';
  onSuccess?: () => void;
};

export default function CustomerForm({ initialData, mode = 'create', onSuccess }: CustomerFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    ruc: initialData?.ruc || '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'edit' && initialData?.id) {
      await updateCustomer(initialData.id, form);
    } else {
      await createCustomer(form);
    }
    setForm({ name: '', email: '', phone: '', ruc: '' });
    if (onSuccess) onSuccess();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block mb-1 font-medium">Nombre</label>
        <Input name="name" required placeholder="Nombre completo" value={form.name} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <Input name="email" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Teléfono</label>
        <Input name="phone" placeholder="(0991) 123-456" value={form.phone} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1 font-medium">RUC</label>
        <Input name="ruc" placeholder="1234567-8" value={form.ruc} onChange={handleChange} />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">Cancelar</Button>
        </DialogClose>
        <Button type="submit">Guardar</Button>
      </DialogFooter>
    </form>
  );
}
