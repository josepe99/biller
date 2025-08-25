"use client";
import { useState } from "react";

type CashRegister = {
  id: string;
  status: string;
  openedBy?: { name?: string };
  openedById?: string;
  openedAt?: string;
  initialCash: number;
  finalCash?: number | string;
  expectedCash?: number | string;
  cashDifference?: number | string;
  openingNotes?: string;
  closingNotes?: string;
};

type EditableFields = Record<string, boolean>;

interface CashRegisterFormProps {
  cashRegister: CashRegister;
  editableFields: EditableFields;
}

export default function CashRegisterForm({ cashRegister, editableFields }: CashRegisterFormProps) {
  const initialForm = {
    id: cashRegister.id,
    status: cashRegister.status,
    openedBy: cashRegister.openedBy?.name || cashRegister.openedById || "",
    openedAt: cashRegister.openedAt ? new Date(cashRegister.openedAt).toLocaleString() : "",
    initialCash: cashRegister.initialCash,
    finalCash: cashRegister.finalCash ?? "",
    expectedCash: cashRegister.expectedCash ?? "",
    cashDifference: cashRegister.cashDifference ?? "",
    openingNotes: cashRegister.openingNotes ?? "",
    closingNotes: cashRegister.closingNotes ?? "",
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full mr-2"
          style={{ background: form.status === "OPEN" ? "#22c55e" : "#ef4444" }}
          aria-label={form.status === "OPEN" ? "Caja abierta" : "Caja cerrada"}
        ></span>
        Caja #{form.id.slice(-5)}
      </h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSave}>
        {/* ID */}
        <div>
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
        {/* Status */}
        <div>
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
        {/* Opened By */}
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
        {/* Opened At */}
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
        {/* Final Cash */}
        <div>
          <label htmlFor="finalCash" className="block text-sm font-semibold text-gray-600 mb-1">Efectivo final</label>
          <input
            id="finalCash"
            type="number"
            className={`w-full border rounded-lg px-3 py-2 ${editableFields.finalCash ? "bg-white" : "bg-gray-100"}`}
            name="finalCash"
            value={form.finalCash}
            disabled={!editableFields.finalCash}
            onChange={handleChange}
            aria-readonly={!editableFields.finalCash}
          />
        </div>
        {/* Expected Cash */}
        <div>
          <label htmlFor="expectedCash" className="block text-sm font-semibold text-gray-600 mb-1">Efectivo esperado</label>
          <input
            id="expectedCash"
            type="number"
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            name="expectedCash"
            value={form.expectedCash}
            disabled={!editableFields.expectedCash}
            onChange={handleChange}
            aria-readonly={!editableFields.expectedCash}
          />
        </div>
        {/* Cash Difference */}
        <div>
          <label htmlFor="cashDifference" className="block text-sm font-semibold text-gray-600 mb-1">Diferencia de efectivo</label>
          <input
            id="cashDifference"
            type="number"
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            name="cashDifference"
            value={form.cashDifference}
            disabled={!editableFields.cashDifference}
            onChange={handleChange}
            aria-readonly={!editableFields.cashDifference}
          />
        </div>
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