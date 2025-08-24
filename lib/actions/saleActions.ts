"use server"

import { SaleController } from "@/lib/controllers/sale.controller";

export async function getSalesHistoryAction(userId: string, limit = 50, offset = 0) {
  const saleController = new SaleController();
  return saleController.getSalesHistory(userId, limit, offset);
}

export async function searchSalesAction(query: string, limit = 20) {
  const saleController = new SaleController();
  return saleController.searchSales(query, limit);
}

export async function createSaleAction(data: Parameters<SaleController['create']>[0]) {
  const saleController = new SaleController();
  return saleController.create(data);
}

export async function getSaleBySaleNumber(saleNumber: string) {
  const saleController = new SaleController();
  return saleController.getBySaleNumber(saleNumber);
}