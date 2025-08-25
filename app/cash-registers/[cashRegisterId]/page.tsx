import { getCashRegisterById } from '@/lib/actions/cashRegisterActions';
import DashboordLayout from '@/components/layout/dashboard-layout';
import CashRegisterForm from './components/CashRegisterForm';
import { notFound } from 'next/navigation';
import React from 'react';

// Variables to control editability of each field
const editableFields: Record<string, boolean> = {
	id: false,
	status: false,
	openedBy: false,
	openedAt: false,
	initialCash: false,
	finalCash: false,
	expectedCash: false,
	cashDifference: false,
	openingNotes: true,
	closingNotes: true,
};


interface CashRegisterPageProps {
	params: {
		cashRegisterId: string;
	};
}

interface CashRegister {
	id: string;
	status: string;
	openedBy?: { name?: string };
	openedById?: string;
	openedAt?: string | Date;
	initialCash: number;
	finalCash?: number | string | null;
	expectedCash?: number | string | null;
	cashDifference?: number | string | null;
	openingNotes?: string;
	closingNotes?: string;
}

export default async function CashRegisterPage({ params }: CashRegisterPageProps) {
	const { cashRegisterId } = await params;
	const cashRegister: any | null = await getCashRegisterById(cashRegisterId);

	if (!cashRegister) notFound();

	// Normalize server data to the shape expected by the client form component.
	const normalized = {
		id: cashRegister.id,
		status: (cashRegister as any).status,
		openedBy: cashRegister.openedBy ?? undefined,
		openedById: cashRegister.openedById ?? undefined,
		openedAt: cashRegister.openedAt ? new Date(cashRegister.openedAt).toString() : undefined,
		initialCash: cashRegister.initialCash,
		finalCash: cashRegister.finalCash ?? undefined,
		expectedCash: cashRegister.expectedCash ?? undefined,
		cashDifference: cashRegister.cashDifference ?? undefined,
		openingNotes: cashRegister.openingNotes ?? undefined,
		closingNotes: cashRegister.closingNotes ?? undefined,
	} as any;

	return (
		<DashboordLayout>
			<div className="mx-auto p-6">
				<CashRegisterForm cashRegister={normalized} editableFields={editableFields} />
			</div>
		</DashboordLayout>
	);
}
