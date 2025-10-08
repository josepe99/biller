import { BaseController } from "./base.controller";
import {
  ReportsDatasource,
  reportsDatasource,
  DailySalesReportFilters,
  ProductSalesReportFilters,
  UserSalesReportFilters,
  DailySalesReportRow,
  ProductSalesReportRow,
  UserSalesReportRow,
} from "@/lib/datasources/reports.datasource";
import { SaleStatus } from "@prisma/client";

const normalizeStatusArray = (
  status?: Array<SaleStatus | string> | SaleStatus | string
): SaleStatus[] | undefined => {
  if (!status) {
    return undefined;
  }

  const source = Array.isArray(status) ? status : [status];
  const parsed = source
    .map((value) =>
      typeof value === "string"
        ? (value.trim().toUpperCase() as SaleStatus)
        : value
    )
    .filter((value): value is SaleStatus =>
      Object.values(SaleStatus).includes(value)
    );

  return parsed.length ? parsed : undefined;
};

const toOptionalString = (value?: string | null) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const toOptionalNumber = (value?: number | string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

export class ReportsController extends BaseController<ReportsDatasource> {
  constructor() {
    super(reportsDatasource);
  }

  async getDailySalesReport(
    filters: Partial<DailySalesReportFilters> & {
      year: number | string;
      month: number | string;
    }
  ): Promise<DailySalesReportRow[]> {
    const year = toOptionalNumber(filters.year);
    const month = toOptionalNumber(filters.month);

    if (!year || !month) {
      throw new Error("Se requiere año y mes válidos para el reporte diario");
    }

    const status = normalizeStatusArray(filters.status);

    return this.datasource.getDailySalesReport({
      year,
      month,
      status,
      checkoutId: toOptionalString(filters.checkoutId),
      userId: toOptionalString(filters.userId),
      customerId: toOptionalString(filters.customerId),
    });
  }

  async getSalesByProduct(
    filters: Partial<ProductSalesReportFilters> = {}
  ): Promise<ProductSalesReportRow[]> {
    const status = normalizeStatusArray(filters.status);

    return this.datasource.getSalesByProduct({
      ...filters,
      status,
      checkoutId: toOptionalString(filters.checkoutId),
      userId: toOptionalString(filters.userId),
      customerId: toOptionalString(filters.customerId),
      productId: toOptionalString(filters.productId),
      from: filters.from,
      to: filters.to,
      limit: toOptionalNumber(filters.limit),
    });
  }

  async getSalesByUser(
    filters: Partial<UserSalesReportFilters> = {}
  ): Promise<UserSalesReportRow[]> {
    const status = normalizeStatusArray(filters.status);

    return this.datasource.getSalesByUser({
      ...filters,
      status,
      checkoutId: toOptionalString(filters.checkoutId),
      userId: toOptionalString(filters.userId),
      customerId: toOptionalString(filters.customerId),
      from: filters.from,
      to: filters.to,
      limit: toOptionalNumber(filters.limit),
    });
  }
}

export const reportsController = new ReportsController();
