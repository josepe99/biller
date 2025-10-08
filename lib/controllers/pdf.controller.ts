import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { SaleController } from "@/lib/controllers/sale.controller";
import { CashRegisterController } from "@/lib/controllers/cashRegister.controller";
import { ReportsController } from "@/lib/controllers/reports.controller";
import type {
  InvoiceFilters,
  InvoiceListItem,
  InvoiceStatus,
} from "@/lib/types/invoices";

import type {
  DailySalesReportFilters,
  DailySalesReportRow,
  ProductSalesReportFilters,
  ProductSalesReportRow,
  UserSalesReportFilters,
  UserSalesReportRow,
} from "@/lib/datasources/reports.datasource";

import { SaleStatus } from "@prisma/client";

type InvoiceListPageRange = {
  from: number;
  to: number;
};

type GenerateInvoiceListParams = {
  filters?: InvoiceFilters | null;
  invoices?: InvoiceListItem[];
  totalCount?: number;
  page?: number;
  pageRange?: InvoiceListPageRange;
};

type InvoicesQueryResult = Awaited<ReturnType<SaleController["getInvoices"]>>;
type SaleWithRelations = InvoicesQueryResult["sales"][number];
type SaleDetailResult = Awaited<ReturnType<SaleController["getBySaleNumber"]>>;
type SaleItemWithProduct = SaleDetailResult extends { saleItems: infer Items }
  ? Items extends Array<infer Item>
    ? Item
    : never
  : never;
type CashRegisterResult = Awaited<ReturnType<CashRegisterController["getById"]>>;

type DailyReportFiltersInput = Partial<DailySalesReportFilters> & {
  year: number | string;
  month: number | string;
  status?: Array<SaleStatus | string> | SaleStatus | string;
};

type ProductReportFiltersInput = Partial<ProductSalesReportFilters> & {
  status?: Array<SaleStatus | string> | SaleStatus | string;
};

type UserReportFiltersInput = Partial<UserSalesReportFilters> & {
  status?: Array<SaleStatus | string> | SaleStatus | string;
};

interface DailyReportSummary {
  total: number;
  saleCount: number;
  averageTicket: number;
  bestDay: DailySalesReportRow | null;
}

interface ProductReportSummary {
  totalQuantity: number;
  totalAmount: number;
}

interface UserReportSummary {
  totalAmount: number;
  saleCount: number;
}

interface BuildDailySalesReportPDFParams {
  filters: DailyReportFiltersInput;
  rows: DailySalesReportRow[];
  summary: DailyReportSummary;
}

interface BuildProductSalesReportPDFParams {
  filters: ProductReportFiltersInput;
  rows: ProductSalesReportRow[];
  summary: ProductReportSummary;
}

interface BuildUserSalesReportPDFParams {
  filters: UserReportFiltersInput;
  rows: UserSalesReportRow[];
  summary: UserReportSummary;
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  COMPLETED: "Completada",
  PENDING: "Pendiente",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

const REPORT_STATUS_LABELS: Record<SaleStatus, string> = {
  COMPLETED: "Completada",
  PENDING: "Pendiente",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const currencyFormatter = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const quantityFormatter = new Intl.NumberFormat("es-PY", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-PY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("es-PY", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

interface TableColumn<T> {
  title: string;
  width: number;
  align?: "left" | "center" | "right";
  getValue: (row: T) => string;
}

interface BuildInvoiceListPDFParams {
  filters: InvoiceFilters;
  invoices: InvoiceListItem[];
  totalCount: number;
  page: number;
  pageRange: InvoiceListPageRange;
}

interface DocumentHeaderParams {
  totalCount: number;
  page: number;
  pageRange: InvoiceListPageRange;
  invoices: InvoiceListItem[];
}

interface InvoiceDetailItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceDetail {
  saleNumber: string;
  createdAt: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string | null;
  cashier: {
    id: string;
    name: string;
    lastname: string | null;
  };
  customer: {
    id: string;
    name: string | null;
    ruc: string | null;
  } | null;
  checkout: {
    id: string;
    name: string | null;
  } | null;
  items: InvoiceDetailItem[];
}

interface CashRegisterBreakdownItem {
  method: string;
  expected: number;
  missing: number;
  actual: number;
}

interface CashRegisterDetail {
  id: string;
  status: string;
  openedBy: string | null;
  openedAt: string | null;
  closedBy: string | null;
  closedAt: string | null;
  checkoutName: string | null;
  initialCash: number;
  expectedTotal: number;
  missingTotal: number;
  actualTotal: number;
  openingNotes: string | null;
  closingNotes: string | null;
  breakdown: CashRegisterBreakdownItem[];
}
export class PDFController {
  private readonly saleController = new SaleController();
  private readonly cashRegisterController = new CashRegisterController();

  private readonly reportsController = new ReportsController();

  async generateInvoiceList(params: GenerateInvoiceListParams = {}) {
    const filters = { ...(params.filters ?? {}) };
    const fetchLimit = Math.min(Math.max(params.totalCount ?? 200, 1), 200);
    const { sales, totalCount } = await this.saleController.getInvoices(
      filters,
      fetchLimit,
      0,
    );
    const invoices = sales.map((sale) => this.mapSaleToInvoice(sale));

    const page = params.page ?? 1;
    const pageRange =
      params.pageRange ?? this.buildDefaultPageRange(invoices.length);

    const pdfBuffer = await this.buildInvoiceListPDF({
      filters,
      invoices,
      totalCount,
      page,
      pageRange,
    });

    return {
      filters,
      invoices,
      totalCount,
      page,
      pageRange,
      pdfBuffer,
    };
  }

  async generateInvoiceDetail(saleNumber: string) {
    const sale = await this.saleController.getBySaleNumber(saleNumber);
    if (!sale) {
      throw new Error(`No se encontró la factura ${saleNumber}`);
    }

    const invoice = this.mapSaleToInvoiceDetail(sale);
    const pdfBuffer = await this.buildInvoiceDetailPDF(invoice);

    return {
      invoice,
      pdfBuffer,
    };
  }


  async generateCashRegisterDetail(cashRegisterId: string) {
    const cashRegister = await this.cashRegisterController.getById(cashRegisterId);
    if (!cashRegister) {
      throw new Error(`No se encontró la caja ${cashRegisterId}`);
    }

    const detail = this.mapCashRegisterToDetail(cashRegister);
    const pdfBuffer = await this.buildCashRegisterDetailPDF(detail);

    return {
      cashRegister: detail,
      pdfBuffer,
    };
  }

  async generateDailySalesReport(params: { filters: DailyReportFiltersInput; rows?: DailySalesReportRow[] }) {
    const rows =
      params.rows ??
      (await this.reportsController.getDailySalesReport(params.filters));
    const summary = this.buildDailyReportSummary(rows);
    const pdfBuffer = await this.buildDailySalesReportPDF({
      filters: params.filters,
      rows,
      summary,
    });

    return {
      filters: params.filters,
      rows,
      summary,
      pdfBuffer,
    };
  }

  async generateProductSalesReport(params: { filters: ProductReportFiltersInput; rows?: ProductSalesReportRow[] }) {
    const rows =
      params.rows ??
      (await this.reportsController.getSalesByProduct(params.filters));
    const summary = this.buildProductReportSummary(rows);
    const pdfBuffer = await this.buildProductSalesReportPDF({
      filters: params.filters,
      rows,
      summary,
    });

    return {
      filters: params.filters,
      rows,
      summary,
      pdfBuffer,
    };
  }

  async generateUserSalesReport(params: { filters: UserReportFiltersInput; rows?: UserSalesReportRow[] }) {
    const rows =
      params.rows ??
      (await this.reportsController.getSalesByUser(params.filters));
    const summary = this.buildUserReportSummary(rows);
    const pdfBuffer = await this.buildUserSalesReportPDF({
      filters: params.filters,
      rows,
      summary,
    });

    return {
      filters: params.filters,
      rows,
      summary,
      pdfBuffer,
    };
  }

  private mapSaleToInvoice(sale: SaleWithRelations): InvoiceListItem {
    const cashier = sale.user
      ? {
          id: sale.user.id,
          name: sale.user.name ?? "Sin nombre",
          lastname: sale.user.lastname ?? null,
        }
      : {
          id: "unknown",
          name: "Sin cajero",
          lastname: null,
        };

    const customer = sale.customer
      ? {
          id: sale.customer.id,
          name: sale.customer.name,
          ruc: sale.customer.ruc,
        }
      : null;

    const checkout = sale.checkout
      ? {
          id: sale.checkout.id,
          name: sale.checkout.name,
        }
      : null;

    const createdAt =
      sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);

    return {
      id: sale.id,
      saleNumber: sale.saleNumber ?? "N/A",
      total: Number(sale.total ?? 0),
      subtotal: Number(sale.subtotal ?? 0),
      tax: Number(sale.tax ?? 0),
      discount: Number(sale.discount ?? 0),
      status: sale.status as InvoiceStatus,
      createdAt: Number.isNaN(createdAt.getTime())
        ? new Date(0).toISOString()
        : createdAt.toISOString(),
      cashier,
      customer,
      checkout,
    };
  }


  private mapSaleToInvoiceDetail(sale: SaleDetailResult): InvoiceDetail {
    const createdAt =
      sale?.createdAt instanceof Date
        ? sale.createdAt
        : new Date(sale?.createdAt ?? Date.now());

    const cashier = sale?.user
      ? {
          id: String(sale.user.id ?? "unknown"),
          name: sale.user.name ?? "Sin nombre",
          lastname: sale.user.lastname ?? null,
        }
      : {
          id: "unknown",
          name: "Sin cajero",
          lastname: null,
        };

    const customer = sale?.customer
      ? {
          id: String(sale.customer.id ?? "unknown"),
          name: sale.customer.name ?? null,
          ruc: sale.customer.ruc ?? null,
        }
      : null;

    const checkout = sale?.checkout
      ? {
          id: String(sale.checkout.id ?? "unknown"),
          name: sale.checkout.name ?? null,
        }
      : null;

    const items = Array.isArray(sale?.saleItems)
      ? sale.saleItems.map((item) => this.mapSaleItemToInvoiceDetail(item))
      : [];

    return {
      saleNumber: sale?.saleNumber ?? "N/A",
      createdAt: Number.isNaN(createdAt.getTime())
        ? new Date(0).toISOString()
        : createdAt.toISOString(),
      status: (sale?.status ?? "PENDING") as InvoiceStatus,
      subtotal: Number(sale?.subtotal ?? 0),
      tax: Number(sale?.tax ?? 0),
      discount: Number(sale?.discount ?? 0),
      total: Number(sale?.total ?? 0),
      notes: sale?.notes ?? null,
      cashier,
      customer,
      checkout,
      items,
    };
  }

  private mapSaleItemToInvoiceDetail(item: SaleItemWithProduct): InvoiceDetailItem {
    const data = item as unknown as {
      quantity?: number;
      unitPrice?: number;
      total?: number;
      product?: { name?: string | null; sku?: string | null };
    };

    const quantity = Number(data?.quantity ?? 0);
    const unitPrice = Number(data?.unitPrice ?? 0);
    const total = Number(data?.total ?? quantity * unitPrice);
    const name = (data?.product?.name ?? "Producto sin nombre").trim();
    const skuValue = data?.product?.sku ?? null;
    const description = `${name}${skuValue ? ` (${skuValue})` : ""}`.trim();

    return {
      description: description.length > 0 ? description : "Producto",
      quantity,
      unitPrice,
      total,
    };
  }

  private buildDefaultPageRange(count: number): InvoiceListPageRange {
    if (count === 0) {
      return { from: 0, to: 0 };
    }
    return { from: 1, to: count };
  }

  private async buildInvoiceListPDF(
    params: BuildInvoiceListPDFParams,
  ): Promise<Buffer> {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const bufferPromise = this.streamToBuffer(doc);

    this.drawDocumentHeader(doc, {
      totalCount: params.totalCount,
      page: params.page,
      pageRange: params.pageRange,
      invoices: params.invoices,
    });

    this.drawFilterSummary(doc, params.filters);
    this.drawInvoiceTable(doc, params.invoices);

    doc.end();
    return bufferPromise;
  }

  private async buildInvoiceDetailPDF(invoice: InvoiceDetail): Promise<Buffer> {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const bufferPromise = this.streamToBuffer(doc);

    this.drawInvoiceDetailHeader(doc, invoice);
    this.drawInvoiceDetailSummary(doc, invoice);
    this.drawInvoiceItemsTable(doc, invoice.items);

    if (invoice.notes && invoice.notes.trim()) {
      doc.moveDown();
      doc.font("Helvetica-Bold").fontSize(12).text("Notas");
      doc.moveDown(0.25);
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(invoice.notes, {
          width:
            doc.page.width - doc.page.margins.left - doc.page.margins.right,
        });
    }

    doc.end();
    return bufferPromise;
  }


  private async buildCashRegisterDetailPDF(detail: CashRegisterDetail): Promise<Buffer> {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const bufferPromise = this.streamToBuffer(doc);

    this.drawCashRegisterHeader(doc, detail);
    this.drawCashRegisterSummary(doc, detail);
    this.drawCashRegisterBreakdown(doc, detail.breakdown);

    if (detail.openingNotes && detail.openingNotes.trim().length > 0) {
      doc.moveDown();
      doc.font("Helvetica-Bold").fontSize(12).text("Notas de apertura");
      doc.moveDown(0.25);
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(detail.openingNotes, {
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        });
    }

    if (detail.closingNotes && detail.closingNotes.trim().length > 0) {
      doc.moveDown();
      doc.font("Helvetica-Bold").fontSize(12).text("Notas de cierre");
      doc.moveDown(0.25);
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(detail.closingNotes, {
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        });
    }

    doc.end();
    return bufferPromise;
  }  private buildDailyReportSummary(rows: DailySalesReportRow[]): DailyReportSummary {
    if (!rows.length) {
      return {
        total: 0,
        saleCount: 0,
        averageTicket: 0,
        bestDay: null,
      };
    }

    let total = 0;
    let saleCount = 0;
    let bestDay: DailySalesReportRow | null = null;

    rows.forEach((row) => {
      total += row.total;
      saleCount += row.saleCount;
      if (!bestDay || row.total > bestDay.total) {
        bestDay = row;
      }
    });

    const averageTicket = saleCount > 0 ? total / saleCount : 0;

    return {
      total,
      saleCount,
      averageTicket,
      bestDay,
    };
  }

  private buildProductReportSummary(rows: ProductSalesReportRow[]): ProductReportSummary {
    return rows.reduce<ProductReportSummary>(
      (acc, row) => ({
        totalQuantity: acc.totalQuantity + row.quantity,
        totalAmount: acc.totalAmount + row.total,
      }),
      { totalQuantity: 0, totalAmount: 0 },
    );
  }

  private buildUserReportSummary(rows: UserSalesReportRow[]): UserReportSummary {
    return rows.reduce<UserReportSummary>(
      (acc, row) => ({
        totalAmount: acc.totalAmount + row.total,
        saleCount: acc.saleCount + row.saleCount,
      }),
      { totalAmount: 0, saleCount: 0 },
    );
  }

  private async buildDailySalesReportPDF(params: BuildDailySalesReportPDFParams): Promise<Buffer> {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const bufferPromise = this.streamToBuffer(doc);

    this.drawDailyReportHeader(doc, params.filters);
    this.drawDailyReportSummary(doc, params.summary);
    this.drawDailyReportTable(doc, params.rows);

    doc.end();
    return bufferPromise;
  }

  private async buildProductSalesReportPDF(params: BuildProductSalesReportPDFParams): Promise<Buffer> {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const bufferPromise = this.streamToBuffer(doc);

    this.drawProductReportHeader(doc, params.filters);
    this.drawProductReportSummary(doc, params.summary);
    this.drawProductReportTable(doc, params.rows);

    doc.end();
    return bufferPromise;
  }

  private async buildUserSalesReportPDF(params: BuildUserSalesReportPDFParams): Promise<Buffer> {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const bufferPromise = this.streamToBuffer(doc);

    this.drawUserReportHeader(doc, params.filters);
    this.drawUserReportSummary(doc, params.summary);
    this.drawUserReportTable(doc, params.rows);

    doc.end();
    return bufferPromise;
  }

  private drawDailyReportHeader(doc: PDFDocument, filters: DailyReportFiltersInput) {
    doc.font("Helvetica-Bold").fontSize(18).text("Reporte de ventas diarias", {
      align: "center",
    });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);

    const monthNumber = Number(filters.month);
    const yearNumber = Number(filters.year);
    const periodLabel =
      !Number.isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= MONTH_NAMES.length && !Number.isNaN(yearNumber)
        ? `${this.getMonthLabel(monthNumber)} ${yearNumber}`
        : `${filters.month}/${filters.year}`;

    doc.text(`Periodo: ${periodLabel}`);

    const statuses = this.normalizeStatusList(filters.status);
    doc.text(`Estados incluidos: ${this.formatStatusLabelList(statuses)}`);

    if (filters.checkoutId) {
      doc.text(`Caja: ${filters.checkoutId}`);
    }
    if (filters.userId) {
      doc.text(`Usuario: ${filters.userId}`);
    }
    if (filters.customerId) {
      doc.text(`Cliente: ${filters.customerId}`);
    }

    doc.moveDown();
  }

  private drawDailyReportSummary(doc: PDFDocument, summary: DailyReportSummary) {
    doc.font("Helvetica-Bold").fontSize(12).text("Resumen del periodo");
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(10);

    doc.text(`Total facturado: ${this.formatCurrency(summary.total)}`);
    doc.text(`Cantidad de ventas: ${this.formatQuantity(summary.saleCount)}`);
    doc.text(`Ticket promedio: ${this.formatCurrency(summary.averageTicket)}`);

    if (summary.bestDay) {
      doc.text(
        `Mejor d�a: ${this.formatFilterDate(summary.bestDay.date)} - ${this.formatCurrency(summary.bestDay.total)} (${this.formatQuantity(summary.bestDay.saleCount)} ventas)`,
      );
    }

    doc.moveDown();
  }

  private drawDailyReportTable(doc: PDFDocument, rows: DailySalesReportRow[]) {
    doc.font("Helvetica-Bold").fontSize(12).text("Detalle diario");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);

    if (!rows.length) {
      doc.text("No hay ventas registradas para el periodo.");
      doc.moveDown();
      return;
    }

    const columns: TableColumn<DailySalesReportRow>[] = [
      {
        title: "Fecha",
        width: 90,
        getValue: (row) => this.formatFilterDate(row.date),
      },
      {
        title: "Ventas",
        width: 60,
        align: "right",
        getValue: (row) => this.formatQuantity(row.saleCount),
      },
      {
        title: "Ticket promedio",
        width: 90,
        align: "right",
        getValue: (row) => this.formatCurrency(row.averageTicket),
      },
      {
        title: "Descuento",
        width: 90,
        align: "right",
        getValue: (row) => this.formatCurrency(row.discount),
      },
      {
        title: "Subtotal",
        width: 90,
        align: "right",
        getValue: (row) => this.formatCurrency(row.subtotal),
      },
      {
        title: "Total",
        width: 90,
        align: "right",
        getValue: (row) => this.formatCurrency(row.total),
      },
    ];

    const columnPositions = this.getColumnPositions(doc, columns);
    this.drawTableHeader(doc, columns, columnPositions);

    rows.forEach((row) => {
      this.drawTableRow(doc, columns, columnPositions, row);
    });

    doc.moveDown();
  }

  private drawProductReportHeader(doc: PDFDocument, filters: ProductReportFiltersInput) {
    doc.font("Helvetica-Bold").fontSize(18).text("Reporte de productos vendidos", {
      align: "center",
    });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);

    const statuses = this.normalizeStatusList(filters.status);
    doc.text(`Estados incluidos: ${this.formatStatusLabelList(statuses)}`);

    const from = filters.from ? this.formatFilterDate(String(filters.from)) : null;
    const to = filters.to ? this.formatFilterDate(String(filters.to)) : null;
    if (from || to) {
      doc.text(`Periodo: ${from ?? "-"} - ${to ?? "-"}`);
    }

    const limit = this.parseLimit(filters.limit);
    if (limit) {
      doc.text(`Top solicitado: ${limit}`);
    }

    if (filters.productId) {
      doc.text(`Producto filtrado: ${filters.productId}`);
    }
    if (filters.checkoutId) {
      doc.text(`Caja: ${filters.checkoutId}`);
    }
    if (filters.userId) {
      doc.text(`Usuario: ${filters.userId}`);
    }
    if (filters.customerId) {
      doc.text(`Cliente: ${filters.customerId}`);
    }

    doc.moveDown();
  }

  private drawProductReportSummary(doc: PDFDocument, summary: ProductReportSummary) {
    doc.font("Helvetica-Bold").fontSize(12).text("Resumen");
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(10);

    doc.text(`Cantidad total vendida: ${this.formatQuantity(summary.totalQuantity)}`);
    doc.text(`Monto total: ${this.formatCurrency(summary.totalAmount)}`);

    doc.moveDown();
  }

  private drawProductReportTable(doc: PDFDocument, rows: ProductSalesReportRow[]) {
    doc.font("Helvetica-Bold").fontSize(12).text("Detalle por producto");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);

    if (!rows.length) {
      doc.text("No hay productos registrados para los filtros seleccionados.");
      doc.moveDown();
      return;
    }

    const columns: TableColumn<ProductSalesReportRow>[] = [
      {
        title: "Producto",
        width: 190,
        getValue: (row) => {
          const lines: string[] = [];
          if (row.name) {
            lines.push(row.name);
          }
          if (row.barcode) {
            lines.push(`C�digo: ${row.barcode}`);
          }
          return lines.length ? lines.join("\n") : "Sin nombre";
        },
      },
      {
        title: "Cantidad",
        width: 60,
        align: "right",
        getValue: (row) => this.formatQuantity(row.quantity),
      },
      {
        title: "Precio prom.",
        width: 85,
        align: "right",
        getValue: (row) => this.formatCurrency(row.averageUnitPrice),
      },
      {
        title: "Total",
        width: 90,
        align: "right",
        getValue: (row) => this.formatCurrency(row.total),
      },
      {
        title: "�ltima venta",
        width: 90,
        getValue: (row) => (row.lastSaleAt ? this.formatDateTime(row.lastSaleAt) : "-"),
      },
    ];

    const columnPositions = this.getColumnPositions(doc, columns);
    this.drawTableHeader(doc, columns, columnPositions);

    rows.forEach((row) => {
      this.drawTableRow(doc, columns, columnPositions, row);
    });

    doc.moveDown();
  }

  private drawUserReportHeader(doc: PDFDocument, filters: UserReportFiltersInput) {
    doc.font("Helvetica-Bold").fontSize(18).text("Reporte de ventas por usuario", {
      align: "center",
    });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);

    const statuses = this.normalizeStatusList(filters.status);
    doc.text(`Estados incluidos: ${this.formatStatusLabelList(statuses)}`);

    const from = filters.from ? this.formatFilterDate(String(filters.from)) : null;
    const to = filters.to ? this.formatFilterDate(String(filters.to)) : null;
    if (from || to) {
      doc.text(`Periodo: ${from ?? "-"} - ${to ?? "-"}`);
    }

    const limit = this.parseLimit(filters.limit);
    if (limit) {
      doc.text(`Top solicitado: ${limit}`);
    }

    if (filters.checkoutId) {
      doc.text(`Caja: ${filters.checkoutId}`);
    }
    if (filters.userId) {
      doc.text(`Usuario filtrado: ${filters.userId}`);
    }
    if (filters.customerId) {
      doc.text(`Cliente: ${filters.customerId}`);
    }

    doc.moveDown();
  }

  private drawUserReportSummary(doc: PDFDocument, summary: UserReportSummary) {
    doc.font("Helvetica-Bold").fontSize(12).text("Resumen");
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(10);

    doc.text(`Ventas totales: ${this.formatQuantity(summary.saleCount)}`);
    doc.text(`Monto total: ${this.formatCurrency(summary.totalAmount)}`);

    doc.moveDown();
  }

  private drawUserReportTable(doc: PDFDocument, rows: UserSalesReportRow[]) {
    doc.font("Helvetica-Bold").fontSize(12).text("Detalle por usuario");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);

    if (!rows.length) {
      doc.text("No hay usuarios con ventas para los filtros seleccionados.");
      doc.moveDown();
      return;
    }

    const columns: TableColumn<UserSalesReportRow>[] = [
      {
        title: "Usuario",
        width: 180,
        getValue: (row) => {
          const nameParts = [row.name, row.lastname].filter(Boolean);
          const lines: string[] = [];
          if (nameParts.length) {
            lines.push(nameParts.join(" "));
          }
          if (row.email) {
            lines.push(row.email);
          }
          return lines.length ? lines.join("\n") : row.userId;
        },
      },
      {
        title: "Ventas",
        width: 60,
        align: "right",
        getValue: (row) => this.formatQuantity(row.saleCount),
      },
      {
        title: "Ticket prom.",
        width: 90,
        align: "right",
        getValue: (row) => this.formatCurrency(row.averageTicket),
      },
      {
        title: "Total",
        width: 90,
        align: "right",
        getValue: (row) => this.formatCurrency(row.total),
      },
      {
        title: "�ltima venta",
        width: 90,
        getValue: (row) => (row.lastSaleAt ? this.formatDateTime(row.lastSaleAt) : "-"),
      },
    ];

    const columnPositions = this.getColumnPositions(doc, columns);
    this.drawTableHeader(doc, columns, columnPositions);

    rows.forEach((row) => {
      this.drawTableRow(doc, columns, columnPositions, row);
    });

    doc.moveDown();
  }

  private normalizeStatusList(
    status?: Array<SaleStatus | string> | SaleStatus | string,
  ): SaleStatus[] {
    if (!status) {
      return [SaleStatus.COMPLETED];
    }

    const source = Array.isArray(status) ? status : [status];
    const parsed = source
      .map((value) =>
        typeof value === "string"
          ? (value.trim().toUpperCase() as SaleStatus)
          : value,
      )
      .filter((value): value is SaleStatus =>
        Object.values(SaleStatus).includes(value),
      );

    return parsed.length ? parsed : [SaleStatus.COMPLETED];
  }

  private formatStatusLabelList(statuses: SaleStatus[]): string {
    if (!statuses.length) {
      return REPORT_STATUS_LABELS[SaleStatus.COMPLETED];
    }

    return statuses
      .map((status) => REPORT_STATUS_LABELS[status] ?? status)
      .join(", ");
  }

  private parseLimit(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value > 0 ? Math.floor(value) : null;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.trim());
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
    }

    return null;
  }

  private formatQuantity(value: number | null | undefined): string {
    const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
    return quantityFormatter.format(amount);
  }

  private getMonthLabel(month: number): string {
    if (Number.isNaN(month) || month < 1 || month > MONTH_NAMES.length) {
      return String(month);
    }
    return MONTH_NAMES[month - 1];
  }

  private async streamToBuffer(doc: PDFDocument): Promise<Buffer> {
    return await new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (error) => reject(error));
    });
  }

  private drawDocumentHeader(doc: PDFDocument, params: DocumentHeaderParams) {
    doc.font("Helvetica-Bold").fontSize(18).text("Reporte de facturas", {
      align: "center",
    });
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);

    doc.text(`Generado: ${this.formatDateTime(new Date())}`);
    doc.text(`Total de facturas: ${params.totalCount}`);
    doc.text(
      `Suma de totales: ${this.formatCurrency(
        this.calculateTotal(params.invoices),
      )}`,
    );
    doc.text(`Pagina actual: ${params.page}`);
    doc.text(`Rango visible: ${params.pageRange.from}-${params.pageRange.to}`);
    doc.moveDown();
  }

  private drawFilterSummary(doc: PDFDocument, filters: InvoiceFilters) {
    doc.font("Helvetica-Bold").fontSize(12).text("Filtros aplicados");
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(10);

    const lines = this.buildFilterLines(filters);
    lines.forEach((line) => doc.text(line));
    doc.moveDown();
  }

  private drawInvoiceTable(
    doc: PDFDocument,
    invoices: InvoiceListItem[],
  ) {
    doc.font("Helvetica-Bold").fontSize(12).text("Detalle de facturas");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);

    if (invoices.length === 0) {
      doc.text("No hay facturas para los filtros seleccionados.");
      return;
    }

    const columns = this.getTableColumns();
    const columnPositions = this.getColumnPositions(doc, columns);

    this.drawTableHeader(doc, columns, columnPositions);

    invoices.forEach((invoice) => {
      this.drawTableRow(doc, columns, columnPositions, invoice);
    });
  }

  private getTableColumns(): TableColumn<InvoiceListItem>[] {
    return [
      {
        title: "Factura",
        width: 60,
        getValue: (invoice) => invoice.saleNumber,
      },
      {
        title: "Fecha",
        width: 100,
        getValue: (invoice) => this.formatDateTime(invoice.createdAt),
      },
      {
        title: "Cajero",
        width: 100,
        getValue: (invoice) => {
          const lastname = invoice.cashier.lastname
            ? ` ${invoice.cashier.lastname}`
            : "";
          return `${invoice.cashier.name}${lastname}`;
        },
      },
      {
        title: "Cliente",
        width: 95,
        getValue: (invoice) => {
          if (!invoice.customer) {
            return "-";
          }
          const parts = [] as string[];
          if (invoice.customer.name) {
            parts.push(invoice.customer.name);
          }
          if (invoice.customer.ruc) {
            parts.push(`RUC: ${invoice.customer.ruc}`);
          }
          return parts.length > 0 ? parts.join("\n") : "-";
        },
      },
      {
        title: "Estado",
        width: 60,
        getValue: (invoice) => STATUS_LABELS[invoice.status] ?? invoice.status,
      },
      {
        title: "Total",
        width: 75,
        align: "right",
        getValue: (invoice) => this.formatCurrency(invoice.total),
      },
    ];
  }

  private getColumnPositions<T>(
    doc: PDFDocument,
    columns: TableColumn<T>[],
  ): number[] {
    const positions: number[] = [];
    let currentX = doc.page.margins.left;
    columns.forEach((column) => {
      positions.push(currentX);
      currentX += column.width;
    });
    return positions;
  }

  private drawTableHeader<T>(
    doc: PDFDocument,
    columns: TableColumn<T>[],
    columnPositions: number[],
  ) {
    const headerY = doc.y;
    doc.font("Helvetica-Bold").fontSize(10);

    columns.forEach((column, index) => {
      doc.text(column.title, columnPositions[index], headerY, {
        width: column.width,
        align: column.align ?? "left",
      });
      doc.y = headerY;
    });

    const headerHeight = this.measureRowHeight(doc, columns, columnPositions, (
      column,
    ) => column.title);
    const lineY = headerY + headerHeight + 2;

    doc.save();
    doc
      .moveTo(doc.page.margins.left, lineY)
      .lineTo(doc.page.width - doc.page.margins.right, lineY)
      .lineWidth(0.5)
      .strokeColor("#bbbbbb")
      .stroke();
    doc.restore();

    doc.y = lineY + 4;
    doc.font("Helvetica").fontSize(10);
  }

  private drawTableRow<T>(
    doc: PDFDocument,
    columns: TableColumn<T>[],
    columnPositions: number[],
    row: T,
  ) {
    const availableHeight =
      doc.page.height - doc.page.margins.bottom - doc.y;
    const rowHeight = this.measureRowHeight(
      doc,
      columns,
      columnPositions,
      (column) => column.getValue(row),
    );

    if (rowHeight + 6 > availableHeight) {
      doc.addPage();
      this.drawTableHeader(doc, columns, columnPositions);
    }

    const rowTop = doc.y;

    columns.forEach((column, index) => {
      const value = column.getValue(row);
      doc.text(value, columnPositions[index], rowTop, {
        width: column.width,
        align: column.align ?? "left",
      });
      doc.y = rowTop;
    });

    const rowBottom = rowTop + rowHeight;

    doc.save();
    doc
      .moveTo(doc.page.margins.left, rowBottom + 2)
      .lineTo(doc.page.width - doc.page.margins.right, rowBottom + 2)
      .lineWidth(0.3)
      .strokeColor("#dddddd")
      .stroke();
    doc.restore();

    doc.y = rowBottom + 6;
  }

  private measureRowHeight<T>(
    doc: PDFDocument,
    columns: TableColumn<T>[],
    columnPositions: number[],
    getText: (column: TableColumn<T>) => string,
  ): number {
    const heights = columns.map((column) => {
      const text = getText(column);
      return doc.heightOfString(text, {
        width: column.width,
        align: column.align ?? "left",
      });
    });

    return Math.max(...heights, 0);
  }


  private drawCashRegisterHeader(doc: PDFDocument, detail: CashRegisterDetail) {
    doc.font("Helvetica-Bold").fontSize(18).text("Reporte de caja", {
      align: "center",
    });
    doc.moveDown(0.75);

    doc.font("Helvetica").fontSize(10);
    doc.text(`Caja: ${detail.checkoutName ?? "-"}`);
    doc.text(`Identificador: ${detail.id}`);
    doc.text(`Estado: ${detail.status || "-"}`);
    doc.text(`Apertura: ${this.formatDateTime(detail.openedAt)}`);
    doc.text(`Cierre: ${this.formatDateTime(detail.closedAt)}`);
    doc.text(`Abierta por: ${detail.openedBy ?? "-"}`);
    doc.text(`Cerrada por: ${detail.closedBy ?? "-"}`);
    doc.moveDown();
  }

  private drawCashRegisterSummary(doc: PDFDocument, detail: CashRegisterDetail) {
    doc.font("Helvetica-Bold").fontSize(12).text("Resumen de montos");
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(10);
    doc.text(`Monto inicial: ${this.formatCurrency(detail.initialCash)}`);
    doc.text(`Total esperado: ${this.formatCurrency(detail.expectedTotal)}`);
    doc.text(`Total faltante: ${this.formatCurrency(detail.missingTotal)}`);
    doc.text(`Total real: ${this.formatCurrency(detail.actualTotal)}`);
    doc.moveDown();
  }

  private drawCashRegisterBreakdown(
    doc: PDFDocument,
    breakdown: CashRegisterBreakdownItem[],
  ) {
    doc.font("Helvetica-Bold").fontSize(12).text("Detalle por metodo");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);

    if (breakdown.length === 0) {
      doc.text("No hay datos de metodos de pago para esta caja.");
      doc.moveDown();
      return;
    }

    const columns: TableColumn<CashRegisterBreakdownItem>[] = [
      {
        title: "Método",
        width: 150,
        getValue: (item) => item.method,
      },
      {
        title: "Esperado",
        width: 110,
        align: "right",
        getValue: (item) => this.formatCurrency(item.expected),
      },
      {
        title: "Faltante",
        width: 110,
        align: "right",
        getValue: (item) => this.formatCurrency(item.missing),
      },
      {
        title: "Real",
        width: 110,
        align: "right",
        getValue: (item) => this.formatCurrency(item.actual),
      },
    ];

    const columnPositions = this.getColumnPositions(doc, columns);
    this.drawTableHeader(doc, columns, columnPositions);
    breakdown.forEach((item) => {
      this.drawTableRow(doc, columns, columnPositions, item);
    });
    doc.moveDown();
  }  private drawInvoiceDetailHeader(doc: PDFDocument, invoice: InvoiceDetail) {
    doc.font("Helvetica-Bold").fontSize(18).text("Factura de venta", {
      align: "center",
    });
    doc.moveDown(0.75);

    doc.font("Helvetica").fontSize(10);
    doc.text(`Número: ${invoice.saleNumber}`);
    doc.text(`Fecha: ${this.formatDateTime(invoice.createdAt)}`);
    doc.text(`Estado: ${STATUS_LABELS[invoice.status] ?? invoice.status}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").fontSize(12).text("Cliente");
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(10);
    doc.text(`Nombre: ${invoice.customer?.name ?? "-"}`);
    doc.text(`RUC: ${invoice.customer?.ruc ?? "-"}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").fontSize(12).text("Cajero");
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(10);
    const lastname = invoice.cashier.lastname
      ? ` ${invoice.cashier.lastname}`
      : "";
    doc.text(`Nombre: ${invoice.cashier.name}${lastname}`);
    if (invoice.checkout?.name) {
      doc.text(`Caja: ${invoice.checkout.name}`);
    }
    doc.moveDown();
  }

  private drawInvoiceDetailSummary(doc: PDFDocument, invoice: InvoiceDetail) {
    doc.font("Helvetica-Bold").fontSize(12).text("Resumen de montos");
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(10);
    doc.text(`Subtotal: ${this.formatCurrency(invoice.subtotal)}`);
    doc.text(`Impuesto: ${this.formatCurrency(invoice.tax)}`);
    doc.text(`Descuento: ${this.formatCurrency(invoice.discount)}`);
    doc.text(`Total: ${this.formatCurrency(invoice.total)}`);
    doc.moveDown();
  }

  private drawInvoiceItemsTable(
    doc: PDFDocument,
    items: InvoiceDetailItem[],
  ) {
    doc.font("Helvetica-Bold").fontSize(12).text("Detalle de items");
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);

    if (items.length === 0) {
      doc.text("No hay items registrados en esta venta.");
      return;
    }

    const columns: TableColumn<InvoiceDetailItem>[] = [
      {
        title: "Producto",
        width: 240,
        getValue: (item) => item.description,
      },
      {
        title: "Cantidad",
        width: 80,
        align: "right",
        getValue: (item) => quantityFormatter.format(item.quantity),
      },
      {
        title: "Precio",
        width: 90,
        align: "right",
        getValue: (item) => this.formatCurrency(item.unitPrice),
      },
      {
        title: "Total",
        width: 90,
        align: "right",
        getValue: (item) => this.formatCurrency(item.total),
      },
    ];

    const columnPositions = this.getColumnPositions(doc, columns);
    this.drawTableHeader(doc, columns, columnPositions);

    items.forEach((item) => {
      this.drawTableRow(doc, columns, columnPositions, item);
    });
  }


  private mapCashRegisterToDetail(cashRegister: CashRegisterResult): CashRegisterDetail {
    const record = cashRegister as unknown as {
      id?: string;
      status?: string;
      openedBy?: { name?: string | null } | null;
      openedById?: string | null;
      openedAt?: unknown;
      closedBy?: { name?: string | null } | null;
      closedById?: string | null;
      closedAt?: unknown;
      checkout?: { name?: string | null } | null;
      checkoutId?: string | null;
      initialCash?: unknown;
      expectedMoney?: unknown;
      missingMoney?: unknown;
      openingNotes?: unknown;
      closingNotes?: unknown;
    };

    const expectedEntries = this.normalizeMoneyEntries(record?.expectedMoney);
    const missingEntries = this.normalizeMoneyEntries(record?.missingMoney);
    const missingMap = new Map(missingEntries.map((entry) => [entry.key, entry.amount] as const));
    const seen = new Set<string>();
    const breakdown: CashRegisterBreakdownItem[] = [];

    expectedEntries.forEach((entry) => {
      const missing = missingMap.get(entry.key) ?? 0;
      seen.add(entry.key);
      breakdown.push({
        method: entry.label,
        expected: entry.amount,
        missing,
        actual: entry.amount - missing,
      });
    });

    missingEntries.forEach((entry) => {
      if (!seen.has(entry.key)) {
        const missing = entry.amount;
        breakdown.push({
          method: entry.label,
          expected: 0,
          missing,
          actual: -missing,
        });
      }
    });

    const expectedTotal = breakdown.reduce((sum, item) => sum + item.expected, 0);
    const missingTotal = breakdown.reduce((sum, item) => sum + item.missing, 0);
    const actualTotal = breakdown.reduce((sum, item) => sum + item.actual, 0);

    return {
      id: this.normalizeString(record?.id) ?? "",
      status: this.normalizeString(record?.status) ?? "",
      openedBy:
        this.normalizeString(record?.openedBy?.name) ??
        this.normalizeString(record?.openedById),
      openedAt: this.normalizeDateValue(record?.openedAt),
      closedBy:
        this.normalizeString(record?.closedBy?.name) ??
        this.normalizeString(record?.closedById),
      closedAt: this.normalizeDateValue(record?.closedAt),
      checkoutName: this.normalizeString(record?.checkout?.name) ?? null,
      initialCash: this.toFiniteNumber(record?.initialCash),
      expectedTotal,
      missingTotal,
      actualTotal,
      openingNotes: this.normalizeString(record?.openingNotes),
      closingNotes: this.normalizeString(record?.closingNotes),
      breakdown,
    };
  }

  private normalizeMoneyEntries(value: unknown): Array<{ key: string; label: string; amount: number }> {
    if (!value || typeof value !== "object") {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map((entry, index) => {
          if (!entry || typeof entry !== "object") {
            return null;
          }
          const record = entry as { method?: unknown; amount?: unknown };
          const keySource = this.normalizeString(record.method) ?? `metodo_${index}`;
          return {
            key: keySource,
            label: this.formatMethodLabel(keySource),
            amount: this.toFiniteNumber(record.amount),
          };
        })
        .filter((entry): entry is { key: string; label: string; amount: number } => Boolean(entry));
    }

    return Object.entries(value as Record<string, unknown>).map(([key, amount]) => ({
      key,
      label: this.formatMethodLabel(key),
      amount: this.toFiniteNumber(amount),
    }));
  }

  private formatMethodLabel(method: string): string {
    if (!method) {
      return "Método";
    }

    const spaced = method
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .toLowerCase();

    return spaced
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") || method;
  }

  private normalizeDateValue(value: unknown): string | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  }

  private normalizeString(value: unknown): string | null {
    if (typeof value !== "string") {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toFiniteNumber(value: unknown): number {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private calculateTotal(invoices: InvoiceListItem[]): number {
    return invoices.reduce(
      (sum, invoice) => sum + Number(invoice.total ?? 0),
      0,
    );
  }

  private buildFilterLines(filters: InvoiceFilters): string[] {
    const lines: string[] = [];

    if (filters.cashierId) {
      lines.push(`Cajero: ${filters.cashierId}`);
    }

    if (filters.statuses && filters.statuses.length > 0) {
      const statuses = filters.statuses
        .map((status) => STATUS_LABELS[status] ?? status)
        .join(", ");
      lines.push(`Estados: ${statuses}`);
    }

    if (filters.dateFrom || filters.dateTo) {
      const from = this.formatFilterDate(filters.dateFrom);
      const to = this.formatFilterDate(filters.dateTo);
      lines.push(`Fechas: ${from} - ${to}`);
    }

    const hasMin = typeof filters.minTotal === "number";
    const hasMax = typeof filters.maxTotal === "number";

    if (hasMin || hasMax) {
      const min = hasMin ? this.formatCurrency(filters.minTotal ?? 0) : "-";
      const max = hasMax ? this.formatCurrency(filters.maxTotal ?? 0) : "-";
      lines.push(`Total entre: ${min} y ${max}`);
    }

    if (filters.search && filters.search.trim()) {
      lines.push(`Busqueda: ${filters.search.trim()}`);
    }

    if (lines.length === 0) {
      lines.push("Sin filtros aplicados.");
    }

    return lines;
  }

  private formatCurrency(value: number | null | undefined): string {
    const amount =
      typeof value === "number" && Number.isFinite(value) ? value : 0;
    return currencyFormatter.format(amount);
  }

  private formatDateTime(value: string | Date | null | undefined): string {
    if (!value) {
      return "-";
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return dateTimeFormatter.format(date);
  }

  private formatFilterDate(value: string | null | undefined): string {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return dateFormatter.format(date);
  }
}

export const pdfController = new PDFController();
export default pdfController;













