import { CashRegisterController } from '../controllers/cashRegister.controller';

const controller = new CashRegisterController();

export const getAllCashRegisters = () => controller.getAll();
export const getCashRegisterById = (id: string) => controller.getById(id);
export const openCheckout = (params: {
	checkoutId: string;
	openedById: string;
	initialCash: number;
	openingNotes?: string;
	openedAt?: Date;
}) => controller.openCheckout(params);
export const closeCheckout = (params: {
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
}) => controller.closeCheckout(params);
export const getActiveCashRegisters = () => controller.getActives();
export const getCashRegistersByUser = (userId: string) => controller.getByUser(userId);
export const updateCashRegister = (id: string, data: any) => controller.update(id, data);
export const deleteCashRegister = (id: string) => controller.delete(id);
