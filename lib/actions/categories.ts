"use server"

import { categoryController } from '@/lib/controllers/category.controller';
import {
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilters
} from '@/lib/datasources/category.datasource';

/**
 * Get all categories
 */
export async function getCategoriesAction(filters: CategoryFilters = {}) {
  try {
    return categoryController.getAll(filters);
  } catch (error) {
    return [];
  }
}

/**
 * Get a category by ID
 */
export async function getCategoryByIdAction(id: string, includeDeleted = false) {
  try {
    const result = await categoryController.getById(id, includeDeleted);
    return result;
  } catch (error) {
    console.error('Error in getCategoryByIdAction:', error);
    return {
      success: false,
      error: 'Failed to fetch category',
      data: null
    };
  }
}

/**
 * Create a new category
 */
export async function createCategoryAction(data: CreateCategoryData) {
  try {
    const result = await categoryController.create(data);
    return result;
  } catch (error) {
    console.error('Error in createCategoryAction:', error);
    return {
      success: false,
      error: 'Failed to create category'
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategoryAction(id: string, data: UpdateCategoryData) {
  try {
    const result = await categoryController.update(id, data);
    return result;
  } catch (error) {
    console.error('Error in updateCategoryAction:', error);
    return {
      success: false,
      error: 'Failed to update category'
    };
  }
}

/**
 * Soft delete a category
 */
export async function deleteCategoryAction(id: string) {
  try {
    const result = await categoryController.delete(id);
    return result;
  } catch (error) {
    console.error('Error in deleteCategoryAction:', error);
    return {
      success: false,
      error: 'Failed to delete category'
    };
  }
}

/**
 * Restore a soft deleted category
 */
export async function restoreCategoryAction(id: string) {
  try {
    const result = await categoryController.restore(id);
    return result;
  } catch (error) {
    console.error('Error in restoreCategoryAction:', error);
    return {
      success: false,
      error: 'Failed to restore category'
    };
  }
}

/**
 * Get categories with product count
 */
export async function getCategoriesWithProductCountAction() {
  try {
    const result = await categoryController.getCategoriesWithProductCount();
    return result;
  } catch (error) {
    console.error('Error in getCategoriesWithProductCountAction:', error);
    return {
      success: false,
      error: 'Failed to fetch categories with product count',
      data: []
    };
  }
}
