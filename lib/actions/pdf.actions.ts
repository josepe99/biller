"use server";

import type { InvoiceFilters, InvoiceListItem } from "@/lib/types/invoices";
import pdfController from "@/lib/controllers/pdf.controller";

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

