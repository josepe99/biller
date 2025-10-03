"use server";

import { reportsController } from "@/lib/controllers/reports.controller";
import type {
  DailySalesReportFilters,
  ProductSalesReportFilters,
  UserSalesReportFilters,
  DailySalesReportRow,
  ProductSalesReportRow,
  UserSalesReportRow,
} from "@/lib/datasources/reports.datasource";
import { SaleStatus } from "@prisma/client";

type StatusInput = SaleStatus | string;

type DailyReportInput = Omit<DailySalesReportFilters, "year" | "month" | "status"> & {
  year: number | string;
  month: number | string;
  status?: StatusInput | StatusInput[];
};

type ProductReportInput = Omit<ProductSalesReportFilters, "status"> & {
  status?: StatusInput | StatusInput[];
};

type UserReportInput = Omit<UserSalesReportFilters, "status"> & {
  status?: StatusInput | StatusInput[];
};

export async function getDailySalesReportAction(
  filters: DailyReportInput
): Promise<DailySalesReportRow[]> {
  return reportsController.getDailySalesReport(filters);
}

export async function getSalesByProductAction(
  filters: ProductReportInput = {}
): Promise<ProductSalesReportRow[]> {
  return reportsController.getSalesByProduct(filters);
}

export async function getSalesByUserAction(
  filters: UserReportInput = {}
): Promise<UserSalesReportRow[]> {
  return reportsController.getSalesByUser(filters);
}
