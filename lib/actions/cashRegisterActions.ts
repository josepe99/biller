"use server"

import { CashRegisterController } from '../controllers/cashRegister.controller';

const controller = new CashRegisterController();

export async function getAllCashRegisters() {
	return await controller.getAll();
}

export async function getCashRegisterById(id: string) {
	return await controller.getById(id);
}

export async function openCheckout(params: {
	checkoutId: string;
	openedById: string;
	initialCash: number;
	openingNotes?: string;
	openedAt?: Date;
}) {
	return await controller.openCheckout(params);
}

export async function closeCheckout(params: {
	id: string;
	closedById: string;
	finalCash: number;
	closingNotes?: string;
	closedAt?: Date;
	totalSales?: number;
	totalCash?: number;
	totalCard?: number;
	totalOther?: number;
	expectedCash?: number;
	cashDifference?: number;
}) {
	return await controller.closeCheckout(params);
}

export async function getActiveCashRegisterByUser(userId: string) {
	return await controller.getActiveByUser(userId);
}

export async function getCashRegistersByUser(userId: string) {
	return await controller.getByUser(userId);
}

export async function updateCashRegister(id: string, data: any) {
	return await controller.update(id, data);
}

export async function deleteCashRegister(id: string) {
	return await controller.delete(id);
}
