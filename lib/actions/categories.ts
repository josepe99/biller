"use server"

import { categoryController } from '@/lib/controllers/category.controller';
import {
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilters
} from '@/lib/datasources/category.datasource';
import { AuthController } from '@/lib/controllers/auth.controller';

const authController = new AuthController();

/**
 * Get all categories
 */
export async function getCategoriesAction(sessionId: string, filters: CategoryFilters = {}) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:read') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
    return categoryController.getAll(filters);
  } catch (error) {
    return [];
  }
}

/**
 * Get a category by ID
 */
export async function getCategoryByIdAction(sessionId: string, id: string, includeDeleted = false) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:read') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
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
export async function createCategoryAction(sessionId: string, data: CreateCategoryData) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:create') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
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
export async function updateCategoryAction(sessionId: string, id: string, data: UpdateCategoryData) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:update') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
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
export async function deleteCategoryAction(sessionId: string, id: string) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:delete') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
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
export async function restoreCategoryAction(sessionId: string, id: string) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:update') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
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
export async function getCategoriesWithProductCountAction(sessionId: string) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:read') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
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
