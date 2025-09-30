import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { SaleController } from "@/lib/controllers/sale.controller";
import type {
  InvoiceFilters,
  InvoiceListItem,
  InvoiceStatus,
} from "@/lib/types/invoices";

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

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  COMPLETED: "Completada",
  PENDING: "Pendiente",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

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

export class PDFController {
  private readonly saleController = new SaleController();

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
      throw new Error(`No se encontro la factura ${saleNumber}`);
    }

    const invoice = this.mapSaleToInvoiceDetail(sale);
    const pdfBuffer = await this.buildInvoiceDetailPDF(invoice);

    return {
      invoice,
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

  private drawInvoiceDetailHeader(doc: PDFDocument, invoice: InvoiceDetail) {
    doc.font("Helvetica-Bold").fontSize(18).text("Factura de venta", {
      align: "center",
    });
    doc.moveDown(0.75);

    doc.font("Helvetica").fontSize(10);
    doc.text(`Numero: ${invoice.saleNumber}`);
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




