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
	expectedMoney: false,
	missingMoney: false,
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
	expectedMoney?: any | null;
	missingMoney?: any | null;
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
		closedAt: cashRegister.closedAt ? new Date(cashRegister.closedAt).toString() : undefined,
		checkout: cashRegister.checkout ?? undefined,
		checkoutId: cashRegister.checkout?.id ?? undefined,
		checkoutName: cashRegister.checkout?.name ?? undefined,
		closedBy: cashRegister.closedBy ?? undefined,
		initialCash: cashRegister.initialCash,
		expectedMoney: cashRegister.expectedMoney ?? undefined,
		missingMoney: cashRegister.missingMoney ?? undefined,
		// Lists for UI: convert object-shaped Json into arrays of { method, amount }
		expectedMoneyList: cashRegister.expectedMoney ? Object.entries(cashRegister.expectedMoney).map(([method, amount]) => ({ method, amount })) : [],
		missingMoneyList: cashRegister.missingMoney ? Object.entries(cashRegister.missingMoney).map(([method, amount]) => ({ method, amount })) : [],
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
