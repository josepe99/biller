"use server";

import { CreditNoteController } from "@/lib/controllers/creditNote.controller";
import type { CreditNoteStatus } from "@prisma/client";

const creditNoteController = new CreditNoteController();

export async function getCreditNotesAction(limit = 50, offset = 0) {
  return creditNoteController.getAllDetailed(limit, offset);
}

export async function getCreditNoteByIdAction(id: string) {
  return creditNoteController.getByIdDetailed(id);
}

export async function searchCreditNotesAction(term: string, limit = 20) {
  return creditNoteController.search(term, limit);
}

export async function createCreditNoteAction(data: Parameters<CreditNoteController["create"]>[0]) {
  return creditNoteController.create(data);
}

export async function updateCreditNoteStatusAction(id: string, status: CreditNoteStatus, reason?: string) {
  return creditNoteController.updateStatus(id, { status, reason });
}

export async function getSuggestedCreditNoteNumberAction(saleId: string) {
  return creditNoteController.getSuggestedNumberForSale(saleId);
}
