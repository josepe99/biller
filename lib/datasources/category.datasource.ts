import { Category, Prisma } from '@prisma/client';
import { BaseDatasource } from './base.datasource';

export interface CreateCategoryData {
  name: string;
  color?: string;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
}

export interface CategoryFilters {
  includeDeleted?: boolean;
  search?: string;
}

export class CategoryDatasource extends BaseDatasource<'category'> {
  constructor() {
    super('category');
  }


  async getAll(filters: CategoryFilters = {}): Promise<Category[]> {
    const { includeDeleted = false, search } = filters;
    const where: Prisma.CategoryWhereInput = {};
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    return await this.model.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.CategoryWhereInput = {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      deletedAt: null,
    };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const category = await this.model.findFirst({ where });
    return !!category;
  }

  async restore(id: string): Promise<Category> {
    return await this.model.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async getCategoriesWithProductCount(): Promise<Array<Category & { productCount: number }>> {
    const categories = await this.model.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return categories.map((category: any) => ({
      ...category,
      productCount: category._count.products,
    }));
  }
}

export const categoryDatasource = new CategoryDatasource();
