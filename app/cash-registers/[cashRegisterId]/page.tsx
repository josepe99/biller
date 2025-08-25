import { getCashRegisterById } from '@/lib/actions/cashRegisterActions';
import CashRegisterForm from './components/CashRegisterForm';
import { DashboardLayout } from '@/components';
import { notFound } from 'next/navigation';
import React from 'react';

// Variables to control editability of each field
const editableFields: Record<string, boolean> = {
	id: false,
	status: false,
	openedBy: false,
	openedAt: false,
	initialCash: true,
	finalCash: true,
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
	openedAt?: string;
	initialCash: number;
	finalCash?: number | string;
	expectedCash?: number | string;
	cashDifference?: number | string;
	openingNotes?: string;
	closingNotes?: string;
}

export default async function CashRegisterPage({ params }: CashRegisterPageProps) {
	const { cashRegisterId } = params;
	const cashRegister: any | null = await getCashRegisterById(cashRegisterId);
	console.log(cashRegister)
}

