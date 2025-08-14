"use server"

import { categoryController } from '@/lib/controllers/category.controller';
import {
  CreateCategoryData,
  UpdateCategoryData,
  CategoryFilters
} from '@/lib/datasources/category.datasource';

export async function getCategoriesAction(filters: CategoryFilters = {}) {
  try {
    return await categoryController.getAll(filters);
  } catch (error) {
    return [];
  }
}

export async function getCategoryByIdAction(id: string) {
  try {
    return await categoryController.getById(id);
  } catch (error) {
    return null;
  }
}

export async function createCategoryAction(data: CreateCategoryData) {
  try {
    return await categoryController.create(data);
  } catch (error) {
    return { success: false, error: 'Failed to create category' };
  }
}

export async function updateCategoryAction(id: string, data: UpdateCategoryData) {
  try {
    return await categoryController.update(id, data);
  } catch (error) {
    return null;
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    return await categoryController.delete(id);
  } catch (error) {
    return { success: false, error: 'Failed to delete category' };
  }
}

export async function restoreCategoryAction(id: string) {
  try {
    return await categoryController.restore(id);
  } catch (error) {
    return { success: false, error: 'Failed to restore category' };
  }
}

export async function getCategoriesWithProductCountAction() {
  try {
    return await categoryController.getCategoriesWithProductCount();
  } catch (error) {
    return { success: false, error: 'Failed to fetch categories with product count' };
  }
}
