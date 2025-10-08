"use server";

import type { InvoiceFilters, InvoiceListItem } from "@/lib/types/invoices";
import pdfController from "@/lib/controllers/pdf.controller";
import { SaleStatus } from "@prisma/client";

type InvoiceListPageRange = {
  from: number;
  to: number;
};

type GenerateInvoiceListPDFInput = {
  filters?: InvoiceFilters | null;
  invoices?: InvoiceListItem[];
  totalCount?: number;
  page?: number;
  pageRange?: InvoiceListPageRange;
};

type PDFDownloadResult = {
  fileName: string;
  mimeType: string;
  base64: string;
  dataUrl: string;
  size: number;
  metadata?: unknown;
};

type StatusFilterInput = SaleStatus | string | Array<SaleStatus | string>;

type DailyReportPDFInput = {
  year: number | string;
  month: number | string;
  status?: StatusFilterInput;
  checkoutId?: string | null;
  userId?: string | null;
  customerId?: string | null;
};

type ProductReportPDFInput = {
  from?: string | Date | null;
  to?: string | Date | null;
  limit?: number | string | null;
  status?: StatusFilterInput;
  checkoutId?: string | null;
  userId?: string | null;
  customerId?: string | null;
  productId?: string | null;
};

type UserReportPDFInput = {
  from?: string | Date | null;
  to?: string | Date | null;
  limit?: number | string | null;
  status?: StatusFilterInput;
  checkoutId?: string | null;
  userId?: string | null;
  customerId?: string | null;
};

export type GenerateInvoiceListPDFResult = PDFDownloadResult;

function buildFileName(prefix: string, suffix?: string): string {
  const timestamp = new Date().toISOString().replace(/[:]/g, "-");
  const normalizedSuffix = suffix
    ? `-${suffix.replace(/[^a-zA-Z0-9_-]/g, "_")}`
    : "";
  return `${prefix}${normalizedSuffix}-${timestamp}.pdf`;
}

export async function generateInvoiceListPDF(
  invoiceData: GenerateInvoiceListPDFInput = {},
): Promise<GenerateInvoiceListPDFResult> {
  const { pdfBuffer, ...rest } = await pdfController.generateInvoiceList(
    invoiceData,
  );

  const base64 = pdfBuffer.toString("base64");
  const fileName = buildFileName("reporte-facturas");
  const dataUrl = `data:application/pdf;base64,${base64}`;

  return {
    fileName,
    mimeType: "application/pdf",
    base64,
    dataUrl,
    size: pdfBuffer.length,
    metadata: rest,
  };
}

export async function generateInvoiceDetailPDF(
  saleNumber: string,
): Promise<PDFDownloadResult> {
  const { pdfBuffer, invoice } = await pdfController.generateInvoiceDetail(
    saleNumber,
  );

  const base64 = pdfBuffer.toString("base64");
  const fileName = buildFileName("factura", saleNumber);
  const dataUrl = `data:application/pdf;base64,${base64}`;

  return {
    fileName,
    mimeType: "application/pdf",
    base64,
    dataUrl,
    size: pdfBuffer.length,
    metadata: { invoice },
  };
}

export async function generateCashRegisterDetailPDF(
  cashRegisterId: string,
): Promise<PDFDownloadResult> {
  const { pdfBuffer, cashRegister } = await pdfController.generateCashRegisterDetail(
    cashRegisterId,
  );

  const base64 = pdfBuffer.toString("base64");
  const fileName = buildFileName("caja", cashRegisterId);
  const dataUrl = `data:application/pdf;base64,${base64}`;

  return {
    fileName,
    mimeType: "application/pdf",
    base64,
    dataUrl,
    size: pdfBuffer.length,
    metadata: { cashRegister },
  };
}

export async function generateDailySalesReportPDF(
  filters: DailyReportPDFInput,
): Promise<PDFDownloadResult> {
  const result = await pdfController.generateDailySalesReport({ filters });
  const { pdfBuffer, ...metadata } = result;
  const base64 = pdfBuffer.toString("base64");

  const monthNumber = Number(filters.month);
  const yearNumber = Number(filters.year);
  const periodSuffix =
    Number.isFinite(monthNumber) && Number.isFinite(yearNumber)
      ? `${yearNumber}-${String(monthNumber).padStart(2, "0")}`
      : undefined;

  const fileName = buildFileName("reporte-ventas-diarias", periodSuffix);
  const dataUrl = `data:application/pdf;base64,${base64}`;

  return {
    fileName,
    mimeType: "application/pdf",
    base64,
    dataUrl,
    size: pdfBuffer.length,
    metadata,
  };
}

export async function generateProductSalesReportPDF(
  filters: ProductReportPDFInput,
): Promise<PDFDownloadResult> {
  const result = await pdfController.generateProductSalesReport({ filters });
  const { pdfBuffer, ...metadata } = result;
  const base64 = pdfBuffer.toString("base64");

  const limitValue =
    filters.limit !== undefined && filters.limit !== null
      ? String(filters.limit).trim()
      : "";
  const limitSuffix = limitValue ? `top-${limitValue}` : undefined;

  const fileName = buildFileName("reporte-productos", limitSuffix);
  const dataUrl = `data:application/pdf;base64,${base64}`;

  return {
    fileName,
    mimeType: "application/pdf",
    base64,
    dataUrl,
    size: pdfBuffer.length,
    metadata,
  };
}

export async function generateUserSalesReportPDF(
  filters: UserReportPDFInput,
): Promise<PDFDownloadResult> {
  const result = await pdfController.generateUserSalesReport({ filters });
  const { pdfBuffer, ...metadata } = result;
  const base64 = pdfBuffer.toString("base64");

  const limitValue =
    filters.limit !== undefined && filters.limit !== null
      ? String(filters.limit).trim()
      : "";
  const limitSuffix = limitValue ? `top-${limitValue}` : undefined;

  const fileName = buildFileName("reporte-usuarios", limitSuffix);
  const dataUrl = `data:application/pdf;base64,${base64}`;

  return {
    fileName,
    mimeType: "application/pdf",
    base64,
    dataUrl,
    size: pdfBuffer.length,
    metadata,
  };
}
