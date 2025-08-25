import { Checkout, CheckoutSummary, CheckoutWithSales } from '@/lib/types';
import { BaseDatasource } from '@/lib/datasources/base.datasource';
import { prisma } from '@/lib/prisma';

export class CheckoutDatasource extends BaseDatasource<'checkout'> {
  constructor() {
    super('checkout');
  }

  getList() {
    return prisma.checkout.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getAllCheckouts(): Promise<CheckoutSummary[]> {
    const checkouts = await prisma.checkout.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        sales: {
          include: {
            user: {
              select: {
                name: true,
                lastname: true,
              },
            },
          },
        },
        cashRegisters: {
          include: {
            openedBy: {
              select: {
                name: true,
                lastname: true,
              },
            },
            closedBy: {
              select: {
                name: true,
                lastname: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return checkouts.map(checkout => ({
      id: checkout.id,
      name: checkout.name,
      description: checkout.description,
  isPrincipal: checkout.isPrincipal ?? false,
      createdAt: checkout.createdAt,
      updatedAt: checkout.updatedAt,
      salesCount: checkout.sales.length,
      cashRegistersCount: checkout.cashRegisters.length,
    }));
  }

  async getCheckoutById(id: string): Promise<CheckoutWithSales | null> {
    const checkout = await prisma.checkout.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
      include: {
        sales: {
          include: {
            user: {
              select: {
                name: true,
                lastname: true,
              },
            },
          },
        },
        cashRegisters: {
          include: {
            openedBy: {
              select: {
                name: true,
                lastname: true,
              },
            },
            closedBy: {
              select: {
                name: true,
                lastname: true,
              },
            },
          },
        },
      },
    });

    if (!checkout) return null;

    return checkout;
  }

  async updateCheckout(id: string, data: any) {
    const checkout = await prisma.checkout.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        updatedAt: new Date(),
      },
      include: {
        sales: true,
        cashRegisters: true,
      },
    });

    return {
      id: checkout.id,
      name: checkout.name,
      description: checkout.description,
      createdAt: checkout.createdAt,
      updatedAt: checkout.updatedAt,
      salesCount: checkout.sales.length,
      cashRegistersCount: checkout.cashRegisters.length,
    };
  }

  async getActiveCheckouts() {
    const checkouts = await prisma.checkout.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return checkouts.map(checkout => ({
      id: checkout.id,
      name: checkout.name,
      description: checkout.description,
      createdAt: checkout.createdAt,
      updatedAt: checkout.updatedAt,
    }));
  }

  async getCheckoutWithSales(id: string) {
    const checkout = await prisma.checkout.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        sales: {
          include: {
            user: {
              select: {
                name: true,
                lastname: true,
              },
            },
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
            saleItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!checkout) return null;

    return {
      id: checkout.id,
      name: checkout.name,
      description: checkout.description,
      createdAt: checkout.createdAt,
      updatedAt: checkout.updatedAt,
      sales: checkout.sales,
    };
  }
}
