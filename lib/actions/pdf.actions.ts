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

type GenerateInvoiceListPDFResult = {
  fileName: string;
  mimeType: string;
  base64: string;
  dataUrl: string;
  size: number;
};

function buildFileName(): string {
  const timestamp = new Date().toISOString().replace(/[:]/g, "-");
  return `reporte-facturas-${timestamp}.pdf`;
}

export async function generateInvoiceListPDF(
  invoiceData: GenerateInvoiceListPDFInput = {}
): Promise<GenerateInvoiceListPDFResult> {
  const { pdfBuffer } = await pdfController.generateInvoiceList(invoiceData);

  const base64 = pdfBuffer.toString("base64");
  const fileName = buildFileName();
  const dataUrl = `data:application/pdf;base64,${base64}`;

  return {
    fileName,
    mimeType: "application/pdf",
    base64,
    dataUrl,
    size: pdfBuffer.length,
  };
}
