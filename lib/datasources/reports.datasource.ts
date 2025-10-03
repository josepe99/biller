import { SaleStatus } from "@prisma/client";
import { prisma } from "../prisma";

export type DateInput = Date | string;

const toObjectId = (value: string) => ({ $oid: value });

const parseDate = (value?: DateInput) => {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const endOfDay = (date: Date) => {
  const result = new Date(date.getTime());
  result.setHours(23, 59, 59, 999);
  return result;
};

const ensureNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const toDateValue = (value: unknown): Date | undefined => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
};

const formatDateKey = (year: number, month: number, day: number) => {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};

const sanitizeLimit = (
  value: number | undefined,
  fallback: number,
  maximum: number
) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return Math.max(1, Math.min(Math.floor(value), maximum));
};

const prefixMatch = (match: Record<string, unknown>, prefix: string) => {
  return Object.fromEntries(
    Object.entries(match).map(([key, val]) => [`${prefix}.${key}`, val])
  );
};

export interface BaseSaleFilters {
  from?: DateInput;
  to?: DateInput;
  status?: SaleStatus[];
  checkoutId?: string;
  userId?: string;
  customerId?: string;
}

export interface DailySalesReportFilters
  extends Omit<BaseSaleFilters, "from" | "to"> {
  year: number;
  month: number;
}

export interface ProductSalesReportFilters extends BaseSaleFilters {
  productId?: string;
  limit?: number;
}

export interface UserSalesReportFilters extends BaseSaleFilters {
  limit?: number;
}

export interface DailySalesReportRow {
  date: string;
  year: number;
  month: number;
  day: number;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  saleCount: number;
  averageTicket: number;
}

export interface ProductSalesReportRow {
  productId: string;
  name?: string;
  barcode?: string;
  quantity: number;
  total: number;
  averageUnitPrice: number;
  lastSaleAt?: Date;
}

export interface UserSalesReportRow {
  userId: string;
  name: string;
  lastname: string;
  email?: string;
  saleCount: number;
  total: number;
  averageTicket: number;
  lastSaleAt?: Date;
}

const buildSaleMatch = (filters: BaseSaleFilters = {}) => {
  const { from, to, status, checkoutId, userId, customerId } = filters;
  const match: Record<string, unknown> = { deletedAt: null };
  const statuses = status?.length ? status : [SaleStatus.COMPLETED];
  match.status = statuses.length === 1 ? statuses[0] : { $in: statuses };

  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  if (fromDate || toDate) {
    const range: Record<string, Date> = {};
    if (fromDate) {
      range.$gte = fromDate;
    }
    if (toDate) {
      range.$lte = endOfDay(toDate);
    }
    match.createdAt = range;
  }

  if (checkoutId) {
    match.checkoutId = toObjectId(checkoutId);
  }
  if (userId) {
    match.userId = toObjectId(userId);
  }
  if (customerId) {
    match.customerId = toObjectId(customerId);
  }

  return match;
};

export class ReportsDatasource {
  async getDailySalesReport(
    filters: DailySalesReportFilters
  ): Promise<DailySalesReportRow[]> {
    const { year, month, status, checkoutId, userId, customerId } = filters;
    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      throw new Error("year and month must be integers");
    }

    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);
    const match = buildSaleMatch({
      status,
      checkoutId,
      userId,
      customerId,
      from,
      to,
    });

    const pipeline: Record<string, unknown>[] = [
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalAmount: { $sum: "$total" },
          subtotalAmount: { $sum: "$subtotal" },
          taxAmount: { $sum: "$tax" },
          discountAmount: { $sum: "$discount" },
          saleCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          day: "$_id.day",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                },
              },
            },
          },
          total: "$totalAmount",
          subtotal: "$subtotalAmount",
          tax: "$taxAmount",
          discount: "$discountAmount",
          saleCount: "$saleCount",
        },
      },
      { $sort: { year: 1, month: 1, day: 1 } },
    ];

    const rows = (await prisma.sale.aggregateRaw({
      pipeline,
    })) as Array<Record<string, unknown>>;

    return rows.map((row) => {
      const yearValue = ensureNumber(row.year);
      const monthValue = ensureNumber(row.month);
      const dayValue = ensureNumber(row.day);
      const total = ensureNumber(row.total);
      const subtotal = ensureNumber(row.subtotal);
      const tax = ensureNumber(row.tax);
      const discount = ensureNumber(row.discount);
      const saleCount = ensureNumber(row.saleCount);
      const date =
        typeof row.date === "string" && row.date
          ? row.date
          : formatDateKey(yearValue, monthValue, dayValue);

      return {
        date,
        year: yearValue,
        month: monthValue,
        day: dayValue,
        total,
        subtotal,
        tax,
        discount,
        saleCount,
        averageTicket: saleCount > 0 ? total / saleCount : 0,
      };
    });
  }

  async getSalesByProduct(
    filters: ProductSalesReportFilters = {}
  ): Promise<ProductSalesReportRow[]> {
    const { productId, limit, ...rest } = filters;
    const saleItemMatch: Record<string, unknown> = { deletedAt: null };

    if (productId) {
      saleItemMatch.productId = toObjectId(productId);
    }

    const saleMatch = prefixMatch(buildSaleMatch(rest), "sale");
    const resolvedLimit = sanitizeLimit(limit ?? 50, 50, 500);

    const pipeline: Record<string, unknown>[] = [
      { $match: saleItemMatch },
      {
        $lookup: {
          from: "Sale",
          localField: "saleId",
          foreignField: "_id",
          as: "sale",
        },
      },
      { $unwind: "$sale" },
      { $match: saleMatch },
      {
        $lookup: {
          from: "Product",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$productId",
          quantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$total" },
          averageUnitPrice: { $avg: "$unitPrice" },
          lastSaleAt: { $max: "$sale.createdAt" },
          name: { $first: "$product.name" },
          barcode: { $first: "$product.barcode" },
        },
      },
      {
        $project: {
          _id: 0,
          productId: { $toString: "$_id" },
          name: "$name",
          barcode: "$barcode",
          quantity: "$quantity",
          total: "$totalAmount",
          averageUnitPrice: "$averageUnitPrice",
          lastSaleAt: "$lastSaleAt",
        },
      },
      { $sort: { total: -1 } },
      { $limit: resolvedLimit },
    ];

    const rows = (await prisma.saleItem.aggregateRaw({
      pipeline,
    })) as Array<Record<string, unknown>>;

    return rows.map((row) => {
      const quantity = ensureNumber(row.quantity);
      const total = ensureNumber(row.total);
      const averageUnitPrice = ensureNumber(row.averageUnitPrice);
      const effectiveAverage =
        quantity > 0 ? total / quantity : averageUnitPrice;

      return {
        productId: typeof row.productId === "string" ? row.productId : "",
        name: typeof row.name === "string" ? row.name : undefined,
        barcode: typeof row.barcode === "string" ? row.barcode : undefined,
        quantity,
        total,
        averageUnitPrice: effectiveAverage,
        lastSaleAt: toDateValue(row.lastSaleAt),
      };
    });
  }

  async getSalesByUser(
    filters: UserSalesReportFilters = {}
  ): Promise<UserSalesReportRow[]> {
    const { limit, ...rest } = filters;
    const match = buildSaleMatch(rest);
    const resolvedLimit = sanitizeLimit(limit ?? 25, 25, 200);

    const pipeline: Record<string, unknown>[] = [
      { $match: match },
      {
        $lookup: {
          from: "User",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$userId",
          name: { $first: "$user.name" },
          lastname: { $first: "$user.lastname" },
          email: { $first: "$user.email" },
          totalAmount: { $sum: "$total" },
          saleCount: { $sum: 1 },
          lastSaleAt: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          _id: 0,
          userId: { $toString: "$_id" },
          name: "$name",
          lastname: "$lastname",
          email: "$email",
          total: "$totalAmount",
          saleCount: "$saleCount",
          lastSaleAt: "$lastSaleAt",
        },
      },
      { $sort: { total: -1 } },
      { $limit: resolvedLimit },
    ];

    const rows = (await prisma.sale.aggregateRaw({
      pipeline,
    })) as Array<Record<string, unknown>>;

    return rows.map((row) => {
      const total = ensureNumber(row.total);
      const saleCount = ensureNumber(row.saleCount);

      return {
        userId: typeof row.userId === "string" ? row.userId : "",
        name: typeof row.name === "string" ? row.name : "",
        lastname: typeof row.lastname === "string" ? row.lastname : "",
        email: typeof row.email === "string" ? row.email : undefined,
        saleCount,
        total,
        averageTicket: saleCount > 0 ? total / saleCount : 0,
        lastSaleAt: toDateValue(row.lastSaleAt),
      };
    });
  }
}

export const reportsDatasource = new ReportsDatasource();
