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

type DailyReportInput = Omit<
  DailySalesReportFilters,
  "year" | "month" | "status"
> & {
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
  const { year, month, ...rest } = filters;
  return reportsController.getDailySalesReport({
    ...rest,
    year: typeof year === "string" ? parseInt(year, 10) : year,
    month: typeof month === "string" ? parseInt(month, 10) : month,
  });
}

function normalizeStatusArray(
  status?: StatusInput | StatusInput[]
): SaleStatus[] | undefined {
  if (status === undefined) return undefined;
  if (Array.isArray(status)) {
    return status as SaleStatus[];
  }
  return [status as SaleStatus];
}

export async function getSalesByProductAction(
  filters: ProductReportInput = {}
): Promise<ProductSalesReportRow[]> {
  const { status, ...rest } = filters;
  const normalizedFilters = {
    ...rest,
    status: normalizeStatusArray(status),
  };
  return reportsController.getSalesByProduct(normalizedFilters);
}

export async function getSalesByUserAction(
  filters: UserReportInput = {}
): Promise<UserSalesReportRow[]> {
  return reportsController.getSalesByUser(filters);
}
