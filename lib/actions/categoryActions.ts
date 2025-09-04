"use server"

import { categoryController } from '@/lib/controllers/category.controller';
import {
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilters
} from '@/lib/datasources/category.datasource';
import { AuthController } from '@/lib/controllers/auth.controller';

const authController = new AuthController();

export async function getCategoriesAction(sessionId: string, filters: CategoryFilters = {}) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:read') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
    return await categoryController.getAll(filters);
  } catch (error) {
    return [];
  }
}

export async function getCategoryByIdAction(sessionId: string, id: string) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:read') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
    return await categoryController.getById(id);
  } catch (error) {
    return null;
  }
}

export async function createCategoryAction(sessionId: string, data: CreateCategoryData) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:create') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
    return await categoryController.create(data);
  } catch (error) {
    return { success: false, error: 'Failed to create category' };
  }
}

export async function updateCategoryAction(sessionId: string, id: string, data: UpdateCategoryData) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:update') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
    return await categoryController.update(id, data);
  } catch (error) {
    return null;
  }
}

export async function deleteCategoryAction(sessionId: string, id: string) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:delete') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
    return await categoryController.delete(id);
  } catch (error) {
    return { success: false, error: 'Failed to delete category' };
  }
}

export async function restoreCategoryAction(sessionId: string, id: string) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:update') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
    return await categoryController.restore(id);
  } catch (error) {
    return { success: false, error: 'Failed to restore category' };
  }
}

export async function getCategoriesWithProductCountAction(sessionId: string) {
  try {
    const perms = await authController.getPermissionsBySessionId(sessionId);
    if (!perms.includes('categories:read') && !perms.includes('categories:manage')) {
      throw new Error('Unauthorized');
    }
    return await categoryController.getCategoriesWithProductCount();
  } catch (error) {
    return { success: false, error: 'Failed to fetch categories with product count' };
  }
}
