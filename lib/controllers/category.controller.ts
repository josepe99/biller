import { Category } from '@prisma/client';
import { CategoryDatasource, CreateCategoryData, UpdateCategoryData, CategoryFilters } from '@/lib/datasources/category.datasource';
import { BaseController } from './base.controller';

export interface CategoryResponse {
  success: boolean;
  data?: Category | Category[];
  message?: string;
  error?: string;
}


export class CategoryController extends BaseController<CategoryDatasource> {
  constructor() {
    super(new CategoryDatasource());
  }

  async create(data: CreateCategoryData): Promise<CategoryResponse> {
    try {
      if (!data.name || data.name.trim() === '') {
        return { success: false, error: 'Category name is required' };
      }
      const nameExists = await this.datasource.existsByName(data.name.trim());
      if (nameExists) {
        return { success: false, error: 'A category with this name already exists' };
      }
      const category = await this.datasource.create({
        name: data.name.trim(),
        color: data.color?.trim() || undefined,
      });
      return { success: true, data: category, message: 'Category created successfully' };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: 'Failed to create category' };
    }
  }

  async getAll(filters: CategoryFilters = {}): Promise<Category[]> {
    try {
      return await this.datasource.getAll(filters);
    } catch (error) {
      return [];
    }
  }

  async getById(id: string): Promise<Category | null> {
    try {
      if (!id || id.trim() === '') {
        return null;
      }
      return await this.datasource.getById(id);
    } catch (error) {
      return null;
    }
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category | null> {
    try {
      if (!id || id.trim() === '') {
        return null;
      }
      const existingCategory = await this.datasource.getById(id);
      if (!existingCategory) {
        return null;
      }
      if (data.name !== undefined) {
        if (!data.name || data.name.trim() === '') {
          return null;
        }
        const nameExists = await this.datasource.existsByName(data.name.trim(), id);
        if (nameExists) {
          return null;
        }
      }
      const updateData: UpdateCategoryData = {};
      if (data.name !== undefined) {
        updateData.name = data.name.trim();
      }
      if (data.color !== undefined) {
        updateData.color = data.color?.trim() || undefined;
      }
      return await this.datasource.update(id, updateData);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<CategoryResponse> {
    try {
      if (!id || id.trim() === '') {
        return { success: false, error: 'Category ID is required' };
      }
      const existingCategory = await this.datasource.getById(id);
      if (!existingCategory) {
        return { success: false, error: 'Category not found' };
      }
      const deletedCategory = await this.datasource.delete(id);
      return { success: true, data: deletedCategory, message: 'Category deleted successfully' };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: 'Failed to delete category' };
    }
  }

  async restore(id: string): Promise<CategoryResponse> {
    try {
      if (!id || id.trim() === '') {
        return { success: false, error: 'Category ID is required' };
      }
  const existingCategory = await this.datasource.getById(id);
      if (!existingCategory) {
        return { success: false, error: 'Category not found' };
      }
      if (!existingCategory.deletedAt) {
        return { success: false, error: 'Category is not deleted' };
      }
      const restoredCategory = await this.datasource.restore(id);
      return { success: true, data: restoredCategory, message: 'Category restored successfully' };
    } catch (error) {
      console.error('Error restoring category:', error);
      return { success: false, error: 'Failed to restore category' };
    }
  }

  async getCategoriesWithProductCount(): Promise<CategoryResponse> {
    try {
      const categories = await this.datasource.getCategoriesWithProductCount();
      return { success: true, data: categories };
    } catch (error) {
      console.error('Error fetching categories with product count:', error);
      return { success: false, error: 'Failed to fetch categories with product count' };
    }
  }
}

export const categoryController = new CategoryController();
