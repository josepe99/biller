import { BaseDatasource } from './base.datasource';
import { prisma } from '@/lib/prisma';
import { CreditNoteStatus } from '@prisma/client';

interface CreditNoteItemInput {
  saleItemId?: string;
  productId?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
  reason?: string;
}

interface CreateCreditNoteInput {
  saleId: string;
  issuedById: string;
  reason?: string;
  status?: CreditNoteStatus;
  creditNoteNumber?: string;
  items: CreditNoteItemInput[];
}

export class CreditNoteDatasource extends BaseDatasource<'creditNote'> {
  constructor() {
    super('creditNote');
  }

  async getAllDetailed(limit = 50, offset = 0) {
    return prisma.creditNote.findMany({
      where: { deletedAt: null },
      orderBy: { issuedAt: 'desc' },
      skip: offset,
      take: limit,
      include: {
        sale: {
          include: {
            customer: true,
          },
        },
        issuedBy: true,
        items: {
          include: {
            product: true,
            saleItem: true,
          },
        },
      },
    });
  }

  async getByIdDetailed(id: string) {
    return prisma.creditNote.findUnique({
      where: { id, deletedAt: null },
      include: {
        sale: {
          include: {
            customer: true,
            saleItems: true,
          },
        },
        issuedBy: true,
        items: {
          include: {
            product: true,
            saleItem: true,
          },
        },
      },
    });
  }

  async search(term: string, limit = 20) {
    const query = term.trim();
    return prisma.creditNote.findMany({
      where: {
        deletedAt: null,
        OR: [
          { creditNoteNumber: { contains: query, mode: 'insensitive' } },
          {
            sale: {
              saleNumber: { contains: query, mode: 'insensitive' },
            },
          },
          {
            sale: {
              customer: {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { ruc: { contains: query, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      },
      orderBy: { issuedAt: 'desc' },
      take: limit,
      include: {
        sale: { include: { customer: true } },
        issuedBy: true,
      },
    });
  }

  async getSuggestedNumberForSale(saleId: string) {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId, deletedAt: null },
      select: { saleNumber: true },
    });

    if (!sale) {
      throw new Error('Venta no encontrada o eliminada.');
    }

    const existingCount = await prisma.creditNote.count({
      where: { saleId },
    });

    return `${sale.saleNumber}-NC${String(existingCount + 1).padStart(2, '0')}`;
  }

  async updateStatus(id: string, data: { status: CreditNoteStatus; reason?: string }) {
    return prisma.creditNote.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.reason !== undefined ? { reason: data.reason } : {}),
      },
      include: {
        sale: { include: { customer: true } },
        issuedBy: true,
        items: {
          include: {
            product: true,
            saleItem: true,
          },
        },
      },
    });
  }

  async create(input: CreateCreditNoteInput) {
    const sale = await prisma.sale.findUnique({
      where: { id: input.saleId, deletedAt: null },
      include: { saleItems: true },
    });

    if (!sale) {
      throw new Error('Venta no encontrada o eliminada.');
    }

    if (!input.items.length) {
      throw new Error('Debes proporcionar al menos un ítem para la nota de crédito.');
    }

    const saleItemsMap = new Map(sale.saleItems.map((item) => [item.id, item]));

    const existingCount = await prisma.creditNote.count({
      where: { saleId: input.saleId },
    });

    const fallbackNumber = `${sale.saleNumber}-NC${String(existingCount + 1).padStart(2, '0')}`;
    const creditNoteNumber = input.creditNoteNumber ?? fallbackNumber;

    const numberExists = await prisma.creditNote.findUnique({
      where: { creditNoteNumber },
    });

    if (numberExists) {
      throw new Error('El número de nota de crédito ya existe.');
    }

    const preparedItems = input.items.map((item) => {
      const baseSaleItem = item.saleItemId ? saleItemsMap.get(item.saleItemId) : undefined;
      const quantity = item.quantity ?? baseSaleItem?.quantity ?? 0;
      const unitPrice = item.unitPrice ?? baseSaleItem?.unitPrice ?? 0;
      const productId = item.productId ?? baseSaleItem?.productId;
      const total = item.total ?? quantity * unitPrice;

      if (!productId) {
        throw new Error('Cada ítem debe tener un producto asociado.');
      }

      return {
        saleItemId: item.saleItemId,
        productId,
        quantity,
        unitPrice,
        total,
        reason: item.reason,
      };
    });

    const total = preparedItems.reduce((acc, item) => acc + item.total, 0);

    return prisma.creditNote.create({
      data: {
        creditNoteNumber,
        saleId: input.saleId,
        issuedById: input.issuedById,
        total,
        reason: input.reason,
        status: input.status ?? CreditNoteStatus.ISSUED,
        deletedAt: null,
        items: {
          create: preparedItems,
        },
      },
      include: {
        sale: { include: { customer: true } },
        issuedBy: true,
        items: {
          include: {
            product: true,
            saleItem: true,
          },
        },
      },
    });
  }
}

export const creditNoteDatasource = new CreditNoteDatasource();

