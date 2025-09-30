import { BaseDatasource } from "./base.datasource";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { SaleStatus } from "@prisma/client";
import type { InvoiceFilters } from "@/lib/types/invoices";

type SaleWithRelations = Awaited<
  ReturnType<typeof prisma.sale.findMany>
> extends Array<infer T>
  ? T
  : never;

export class SaleDatasource extends BaseDatasource<"sale"> {
  constructor() {
    super("sale");
  }

  /**
   * Creates a sale, its items, and its transactions (multi-payment).
   * @param saleData - Sale data, including items and payments.
   * @returns The created sale with items and transactions.
   */
  async create(saleData: {
    sale: {
      saleNumber: string;
      total: number;
      subtotal: number;
      tax?: number;
      discount?: number;
      status?: import("@prisma/client").SaleStatus;
      userId: string;
      customerId?: string;
      checkoutId: string;
      cashRegisterId?: string;
      notes?: string;
      createdAt?: Date;
      updatedAt?: Date;
      deletedAt?: Date | null;
    };
    items: Array<{
      quantity: number;
      unitPrice: number;
      total: number;
      productId: string;
    }>;
    payments: Array<{
      paymentMethod: import("@prisma/client").PaymentMethod;
      movement: import("@prisma/client").MovementType;
      description?: string;
      amount: number;
      userId?: string;
      checkoutId?: string;
      cashRegisterId?: string;
      createdAt?: Date;
      updatedAt?: Date;
      deletedAt?: Date | null;
      voucherIdentifier?: string; // Identificador de comprobante para pagos no efectivos
    }>;
  }) {
    return await prisma.sale.create({
      data: {
        ...saleData.sale,
        deletedAt: null,
        saleItems: {
          create: saleData.items.map(
            ({ quantity, unitPrice, total, productId }) => ({
              quantity,
              unitPrice,
              total,
              product: { connect: { id: productId } },
            })
          ),
        },
        transactions: {
          create: saleData.payments.map((payment) => {
            // Si el método no es efectivo y tiene voucherIdentifier, lo incluimos
            if (payment.paymentMethod !== "CASH" && payment.voucherIdentifier) {
              return {
                ...payment,
                voucherIdentifier: payment.voucherIdentifier,
              };
            }
            // Si es efectivo o no tiene voucher, lo mandamos igual (sin voucherIdentifier)
            const { voucherIdentifier, ...rest } = payment;
            return rest;
          }),
        },
      },
      include: {
        saleItems: true,
        transactions: true,
      },
    });
  }

  async getBySaleNumber(saleNumber: string) {
    return await prisma.sale.findUnique({
      where: { saleNumber, deletedAt: null },
      include: {
        saleItems: { include: { product: true } },
        user: true,
        customer: true,
      },
    });
  }

  async getById(id: string) {
    return await prisma.sale.findUnique({
      where: { id, deletedAt: null },
      include: {
        saleItems: { include: { product: true } },
        user: true,
        customer: true,
      },
    });
  }

  async getSalesHistory(userId: string, limit = 50, offset = 0) {
    return await prisma.sale.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        saleItems: { include: { product: true } },
        user: true,
        customer: true,
      },
      where: { deletedAt: null, userId: userId },
    });
  }

  async getInvoicesWithFilters(
    filters: InvoiceFilters = {},
    limit = 50,
    offset = 0
  ): Promise<{ sales: SaleWithRelations[]; totalCount: number }> {
    const {
      cashierId,
      statuses,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      search,
    } = filters;

    const conditions: Prisma.SaleWhereInput[] = [{ deletedAt: null }];

    if (cashierId) {
      conditions.push({ userId: cashierId });
    }

    if (Array.isArray(statuses) && statuses.length > 0) {
      const allowedStatuses = (Object.values(SaleStatus) as string[]).filter(
        Boolean
      );
      const normalizedStatuses = statuses
        .filter(
          (status): status is string =>
            typeof status === "string" && allowedStatuses.includes(status)
        )
        .map((status) => status as SaleStatus);

      if (normalizedStatuses.length > 0) {
        conditions.push({ status: { in: normalizedStatuses } });
      }
    }

    const fromDate = dateFrom ? new Date(dateFrom) : undefined;
    const toDate = dateTo ? new Date(dateTo) : undefined;
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }

    if (fromDate || toDate) {
      const range: Prisma.DateTimeFilter = {};
      if (fromDate) {
        range.gte = fromDate;
      }
      if (toDate) {
        range.lte = toDate;
      }
      conditions.push({ createdAt: range });
    }

    const min =
      typeof minTotal === "number" && !Number.isNaN(minTotal)
        ? minTotal
        : undefined;
    const max =
      typeof maxTotal === "number" && !Number.isNaN(maxTotal)
        ? maxTotal
        : undefined;

    if (min !== undefined || max !== undefined) {
      const totalRange: Prisma.FloatFilter = {};
      if (min !== undefined) {
        totalRange.gte = min;
      }
      if (max !== undefined) {
        totalRange.lte = max;
      }
      conditions.push({ total: totalRange });
    }

    if (search && search.trim()) {
      const term = search.trim();
      conditions.push({
        OR: [
          { saleNumber: { contains: term, mode: "insensitive" } },
          { user: { name: { contains: term, mode: "insensitive" } } },
          { user: { lastname: { contains: term, mode: "insensitive" } } },
          { customer: { name: { contains: term, mode: "insensitive" } } },
          { customer: { ruc: { contains: term, mode: "insensitive" } } },
        ],
      });
    }

    const where: Prisma.SaleWhereInput =
      conditions.length > 1 ? { AND: conditions } : conditions[0];

    const parsedLimit =
      typeof limit === "number" && Number.isFinite(limit) ? limit : 50;
    const parsedOffset =
      typeof offset === "number" && Number.isFinite(offset) ? offset : 0;
    const safeTake = Math.min(Math.max(parsedLimit, 1), 200);
    const safeSkip = Math.max(parsedOffset, 0);

    const [sales, totalCount] = await prisma.$transaction([
      prisma.sale.findMany({
        where,
        include: {
          user: true,
          customer: true,
          checkout: true,
        },
        orderBy: { createdAt: "desc" },
        take: safeTake,
        skip: safeSkip,
      }),
      prisma.sale.count({ where }),
    ]);

    return { sales, totalCount };
  }

  async getInvoiceCashiers() {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        sales: { some: { deletedAt: null } },
      },
      select: {
        id: true,
        name: true,
        lastname: true,
      },
      orderBy: [{ name: "asc" }, { lastname: "asc" }],
    });

    return users;
  }

  /**
   * Busca ventas por coincidencia parcial en saleNumber, ruc o nombre del cliente
   */
  async searchSales(query: string, limit = 20) {
    return await prisma.sale.findMany({
      where: {
        deletedAt: null,
        OR: [
          { saleNumber: { contains: query, mode: "insensitive" } },
          {
            customer: {
              OR: [
                { ruc: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
              ],
            },
          },
        ],
      },
      include: {
        saleItems: { include: { product: true } },
        user: true,
        customer: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }
}

export const saleDatasource = new SaleDatasource();
