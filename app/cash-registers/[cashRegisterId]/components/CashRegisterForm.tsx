"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useState } from "react";
import Link from "next/link";

type CashRegister = {
  id: string;
  status: string;
  openedBy?: { name?: string };
  openedById?: string;
  openedAt?: string;
  checkout?: { id?: string; name?: string };
  checkoutId?: string;
  checkoutName?: string;
  closedBy?: { name?: string } | string | null;
  initialCash: number;
  // New shape: objects per payment method (camelCase keys). UI shows only the 'cash' slot.
  expectedMoney?: any;
  missingMoney?: any;
  openingNotes?: string;
  closingNotes?: string;
};

type EditableFields = Record<string, boolean>;

interface CashRegisterFormProps {
  cashRegister: CashRegister & { expectedMoneyList?: { method: string; amount: any }[]; missingMoneyList?: { method: string; amount: any }[] };
  editableFields: EditableFields;
}

export default function CashRegisterForm({ cashRegister, editableFields }: CashRegisterFormProps) {
  const initialForm = {
    id: cashRegister.id,
    status: cashRegister.status,
    openedBy: cashRegister.openedBy?.name || cashRegister.openedById || "",
    openedAt: cashRegister.openedAt ? new Date(cashRegister.openedAt).toLocaleString() : "",
    initialCash: cashRegister.initialCash,
    // expose the 'cash' entry from the new objects as simple numeric inputs in the UI
    expectedMoneyCash: (cashRegister.expectedMoney && (cashRegister.expectedMoney as any).cash) ?? "",
    missingMoneyCash: (cashRegister.missingMoney && (cashRegister.missingMoney as any).cash) ?? "",
    openingNotes: cashRegister.openingNotes ?? "",
    closingNotes: cashRegister.closingNotes ?? "",
    checkoutName: (cashRegister as any).checkout?.name ?? (cashRegister as any).checkoutName ?? '',
    closedByName: (cashRegister as any).closedBy?.name ?? (typeof cashRegister.closedBy === 'string' ? cashRegister.closedBy : ''),
    closedAt: (cashRegister as any).closedAt ? new Date((cashRegister as any).closedAt).toLocaleString() : '',
  };

  const [form, setForm] = useState(initialForm);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: Implement save logic
    alert("Guardar cambios (no implementado)");
  }

  function handleCancel() {
    setForm(initialForm);
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/cash-registers">
            <Button variant="outline" size="icon" className="border-orange-200 text-orange-600 hover:bg-orange-50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="font-semibold text-lg text-orange-500">
            {cashRegister.checkout?.name}
          </span>
        </div>
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSave}>
        {/* ID, Checkout Name and Status - responsive row */}
        <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label htmlFor="id" className="block text-sm font-semibold text-gray-600 mb-1">ID</label>
            <input
              id="id"
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              name="id"
              value={form.id}
              disabled={!editableFields.id}
              onChange={handleChange}
              aria-readonly={!editableFields.id}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="checkoutName" className="block text-sm font-semibold text-gray-600 mb-1">Caja / Checkout</label>
            <input
              id="checkoutName"
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              name="checkoutName"
              value={form.checkoutName}
              disabled={true}
              onChange={handleChange}
              aria-readonly={true}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="status" className="block text-sm font-semibold text-gray-600 mb-1">Estado</label>
            <input
              id="status"
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              name="status"
              value={form.status}
              disabled={!editableFields.status}
              onChange={handleChange}
              aria-readonly={!editableFields.status}
            />
          </div>
        </div>
        {/* Abierto por (left) and Fecha de apertura (right) */}
        <div>
          <label htmlFor="openedBy" className="block text-sm font-semibold text-gray-600 mb-1">Abierto por</label>
          <input
            id="openedBy"
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            name="openedBy"
            value={form.openedBy}
            disabled={!editableFields.openedBy}
            onChange={handleChange}
            aria-readonly={!editableFields.openedBy}
          />
        </div>
        <div>
          <label htmlFor="openedAt" className="block text-sm font-semibold text-gray-600 mb-1">Fecha de apertura</label>
          <input
            id="openedAt"
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            name="openedAt"
            value={form.openedAt}
            disabled={!editableFields.openedAt}
            onChange={handleChange}
            aria-readonly={!editableFields.openedAt}
          />
        </div>

        {/* Cerrada por (left) and Fecha de cierre (right) */}
        <div>
          <label htmlFor="closedBy" className="block text-sm font-semibold text-gray-600 mb-1">Cerrada por</label>
          <input
            id="closedBy"
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            name="closedByName"
            value={form.closedByName}
            disabled={true}
            onChange={handleChange}
            aria-readonly={true}
          />
        </div>
        <div>
          <label htmlFor="closedAt" className="block text-sm font-semibold text-gray-600 mb-1">Fecha de cierre</label>
          <input
            id="closedAt"
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            name="closedAt"
            value={form.closedAt}
            disabled={true}
            aria-readonly={true}
          />
        </div>
        {/* Initial Cash */}
        <div>
          <label htmlFor="initialCash" className="block text-sm font-semibold text-gray-600 mb-1">Efectivo inicial</label>
          <input
            id="initialCash"
            type="number"
            className={`w-full border rounded-lg px-3 py-2 ${editableFields.initialCash ? "bg-white" : "bg-gray-100"}`}
            name="initialCash"
            value={form.initialCash}
            disabled={!editableFields.initialCash}
            onChange={handleChange}
            aria-readonly={!editableFields.initialCash}
          />
        </div>
        {/* Expected Money (cash slot) */}
        <div>
          <label htmlFor="expectedMoneyCash" className="block text-sm font-semibold text-gray-600 mb-1">Efectivo esperado</label>
          <input
            id="expectedMoneyCash"
            type="number"
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            name="expectedMoneyCash"
            value={form.expectedMoneyCash}
            disabled={!editableFields.expectedMoney}
            onChange={handleChange}
            aria-readonly={!editableFields.expectedMoney}
          />
        </div>
        {/* Actual Money at Close (Expected - Missing) */}
        <div>
          <label htmlFor="actualMoneyCash" className="block text-sm font-semibold text-gray-600 mb-1">Efectivo real al cierre</label>
          <input
            id="actualMoneyCash"
            type="number"
            className="w-full border rounded-lg px-3 py-2 bg-green-50 border-green-200"
            name="actualMoneyCash"
            value={(() => {
              const expected = Number(form.expectedMoneyCash) || 0;
              const missing = Number(form.missingMoneyCash) || 0;
              return expected - missing;
            })()}
            disabled={true}
            readOnly
            aria-readonly={true}
          />
        </div>
        {/* Missing Money (cash slot) - only show if there's a missing amount > 0 */}
        {(form.missingMoneyCash && Number(form.missingMoneyCash) > 0) && (
          <div>
            <label htmlFor="missingMoneyCash" className="block text-sm font-semibold text-gray-600 mb-1">Diferencia de efectivo</label>
            <input
              id="missingMoneyCash"
              type="number"
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              name="missingMoneyCash"
              value={form.missingMoneyCash}
              disabled={!editableFields.missingMoney}
              onChange={handleChange}
              aria-readonly={!editableFields.missingMoney}
            />
          </div>
        )}
        {/* Opening Notes */}
        <div className="md:col-span-2">
          <label htmlFor="openingNotes" className="block text-sm font-semibold text-gray-600 mb-1">Notas de apertura</label>
          <textarea
            id="openingNotes"
            className={`w-full border rounded-lg px-3 py-2 ${editableFields.openingNotes ? "bg-white" : "bg-gray-100"}`}
            name="openingNotes"
            value={form.openingNotes}
            disabled={!editableFields.openingNotes}
            onChange={handleChange}
            aria-readonly={!editableFields.openingNotes}
          />
        </div>
        {/* Closing Notes */}
        <div className="md:col-span-2">
          <label htmlFor="closingNotes" className="block text-sm font-semibold text-gray-600 mb-1">Notas de cierre</label>
          <textarea
            id="closingNotes"
            className={`w-full border rounded-lg px-3 py-2 ${editableFields.closingNotes ? "bg-white" : "bg-gray-100"}`}
            name="closingNotes"
            value={form.closingNotes}
            disabled={!editableFields.closingNotes}
            onChange={handleChange}
            aria-readonly={!editableFields.closingNotes}
          />
        </div>
        {/* Expected money breakdown (read-only list) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Desglose esperado por método de pago</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(cashRegister.expectedMoneyList || []).map((item) => (
              <div key={item.method} className="flex items-center gap-3">
                <div className="w-1/2 text-sm text-gray-700 capitalize">{item.method}</div>
                <div className="w-1/2 text-sm text-gray-900">{item.amount ?? 0}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Missing money breakdown (read-only list) - only show if there are missing amounts > 0 */}
        {(cashRegister.missingMoneyList || []).filter(item => (item.amount ?? 0) > 0).length > 0 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-2">Faltantes por método</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(cashRegister.missingMoneyList || [])
                .filter(item => (item.amount ?? 0) > 0)
                .map((item) => (
                  <div key={item.method} className="flex items-center gap-3">
                    <div className="w-1/2 text-sm text-gray-700 capitalize">{item.method}</div>
                    <div className="w-1/2 text-sm text-gray-900">{item.amount ?? 0}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {/* Actual money at close breakdown (Expected - Missing) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Dinero real al cierre por método</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(cashRegister.expectedMoneyList || []).map((expectedItem) => {
              const missingItem = (cashRegister.missingMoneyList || []).find(missing => missing.method === expectedItem.method);
              const expectedAmount = Number(expectedItem.amount) || 0;
              const missingAmount = Number(missingItem?.amount) || 0;
              const actualAmount = expectedAmount - missingAmount;

              return (
                <div key={expectedItem.method} className="flex items-center gap-3 bg-green-50 px-2 py-1 rounded">
                  <div className="w-1/2 text-sm text-gray-700 capitalize font-medium">{expectedItem.method}</div>
                  <div className="w-1/2 text-sm text-green-800 font-semibold">{actualAmount}</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* removed duplicate Closed By (moved earlier) */}
        {/* Actions */}
        <div className="md:col-span-2 flex gap-4 justify-end mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}