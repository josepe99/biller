"use server"

import { SaleController } from "@/lib/controllers/sale.controller";

export async function getSalesHistoryAction(limit = 50, offset = 0) {
  const saleController = new SaleController();
  return saleController.getSalesHistory(limit, offset);
}

export async function searchSalesAction(query: string, limit = 20) {
  const saleController = new SaleController();
  return saleController.searchSales(query, limit);
}