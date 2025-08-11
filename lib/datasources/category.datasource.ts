import { Category, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface CreateCategoryData {
  name: string
  color?: string
}

export interface UpdateCategoryData {
  name?: string
  color?: string
}

export interface CategoryFilters {
  includeDeleted?: boolean
  search?: string
}

export class CategoryDatasource {
  /**
   * Create a new category
   */
  async create(data: CreateCategoryData): Promise<Category> {
    return await prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
      },
    })
  }

  /**
   * Get all categories (excluding soft deleted by default)
   */
  async getAll(filters: CategoryFilters = {}): Promise<Category[]> {
    const { includeDeleted = false, search } = filters

    const where: Prisma.CategoryWhereInput = {}

    // Add search filter if provided
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    if (includeDeleted) {
      return await prisma.category.findMany({
        where,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })
    } else {
      return await prisma.category.findMany({
        where,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })
    }
  }

  /**
   * Get a category by ID
   */
  async getById(id: string, includeDeleted = false): Promise<Category | null> {
    if (includeDeleted) {
      return await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      })
    } else {
      return await prisma.category.findFirst({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      })
    }
  }

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    return await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Soft delete a category
   */
  async delete(id: string): Promise<Category> {
    return await prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })
  }

  /**
   * Restore a soft deleted category
   */
  async restore(id: string): Promise<Category> {
    return await prisma.category.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    })
  }

  /**
   * Check if a category name already exists (excluding soft deleted)
   */
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.CategoryWhereInput = {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      deletedAt: null,
    }

    if (excludeId) {
      where.id = {
        not: excludeId,
      }
    }

    const category = await prisma.category.findFirst({
      where,
    })

    return !!category
  }

  /**
   * Get categories with product count
   */
  async getCategoriesWithProductCount(): Promise<Array<Category & { productCount: number }>> {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return categories.map((category: any) => ({
      ...category,
      productCount: category._count.products,
    }))
  }
}

export const categoryDatasource = new CategoryDatasource()
