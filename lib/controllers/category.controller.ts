import { Category } from '@prisma/client'
import { 
  categoryDatasource, 
  CreateCategoryData, 
  UpdateCategoryData, 
  CategoryFilters 
} from '@/lib/datasources/category.datasource'

export interface CategoryResponse {
  success: boolean
  data?: Category | Category[]
  message?: string
  error?: string
}

export class CategoryController {
  /**
   * Create a new category
   */
  async create(data: CreateCategoryData): Promise<CategoryResponse> {
    try {
      // Validate required fields
      if (!data.name || data.name.trim() === '') {
        return {
          success: false,
          error: 'Category name is required',
        }
      }

      // Check if category name already exists
      const nameExists = await categoryDatasource.existsByName(data.name.trim())
      if (nameExists) {
        return {
          success: false,
          error: 'A category with this name already exists',
        }
      }

      // Create the category
      const category = await categoryDatasource.create({
        name: data.name.trim(),
        color: data.color?.trim() || undefined,
      })

      return {
        success: true,
        data: category,
        message: 'Category created successfully',
      }
    } catch (error) {
      console.error('Error creating category:', error)
      return {
        success: false,
        error: 'Failed to create category',
      }
    }
  }

  /**
   * Get all categories
   */
  async getAll(filters: CategoryFilters = {}): Promise<Category[]> {
    try {
      return categoryDatasource.getAll(filters);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get a category by ID
   */
  async getById(id: string, includeDeleted = false): Promise<Category | null> {
    try {
      // Validate ID
      if (!id || id.trim() === '') {
        return null;
      }

      const category = await categoryDatasource.getById(id, includeDeleted);

      if (!category) {
        return null;
      }

      return category;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryData): Promise<Category | null> {
    try {
      // Validate ID
      if (!id || id.trim() === '') {
        return null;
      }

      // Check if category exists and is not deleted
      const existingCategory = await categoryDatasource.getById(id)
      if (!existingCategory) {
        return null;
      }

      // Validate name if provided
      if (data.name !== undefined) {
        if (!data.name || data.name.trim() === '') {
          return null;
        }

        // Check if the new name already exists (excluding current category)
        const nameExists = await categoryDatasource.existsByName(data.name.trim(), id)
        if (nameExists) {
          return null;
        }
      }

      // Prepare update data
      const updateData: UpdateCategoryData = {}
      if (data.name !== undefined) {
        updateData.name = data.name.trim()
      }
      if (data.color !== undefined) {
        updateData.color = data.color?.trim() || undefined
      }

      // Update the category
      return categoryDatasource.update(id, updateData)
    } catch (error) {
      return null;
    }
  }

  /**
   * Soft delete a category
   */
  async delete(id: string): Promise<CategoryResponse> {
    try {
      // Validate ID
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Category ID is required',
        }
      }

      // Check if category exists and is not already deleted
      const existingCategory = await categoryDatasource.getById(id)
      if (!existingCategory) {
        return {
          success: false,
          error: 'Category not found',
        }
      }

      // Soft delete the category
      const deletedCategory = await categoryDatasource.delete(id)

      return {
        success: true,
        data: deletedCategory,
        message: 'Category deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      return {
        success: false,
        error: 'Failed to delete category',
      }
    }
  }

  /**
   * Restore a soft deleted category
   */
  async restore(id: string): Promise<CategoryResponse> {
    try {
      // Validate ID
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Category ID is required',
        }
      }

      // Check if category exists and is deleted
      const existingCategory = await categoryDatasource.getById(id, true)
      if (!existingCategory) {
        return {
          success: false,
          error: 'Category not found',
        }
      }

      if (!existingCategory.deletedAt) {
        return {
          success: false,
          error: 'Category is not deleted',
        }
      }

      // Restore the category
      const restoredCategory = await categoryDatasource.restore(id)

      return {
        success: true,
        data: restoredCategory,
        message: 'Category restored successfully',
      }
    } catch (error) {
      console.error('Error restoring category:', error)
      return {
        success: false,
        error: 'Failed to restore category',
      }
    }
  }

  /**
   * Get categories with product count
   */
  async getCategoriesWithProductCount(): Promise<CategoryResponse> {
    try {
      const categories = await categoryDatasource.getCategoriesWithProductCount()

      return {
        success: true,
        data: categories,
      }
    } catch (error) {
      console.error('Error fetching categories with product count:', error)
      return {
        success: false,
        error: 'Failed to fetch categories with product count',
      }
    }
  }
}

export const categoryController = new CategoryController()
