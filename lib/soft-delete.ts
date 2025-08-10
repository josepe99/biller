import { Prisma } from '@prisma/client'

/**
 * Utility functions for soft deletion functionality
 * These help implement soft deletes across all models with deletedAt field
 */

// Type for models that support soft deletion
export type SoftDeletableModel = {
  deletedAt?: Date | null
}

// Generic where clause to exclude soft deleted records
export const excludeDeleted = {
  deletedAt: null
} as const

// Generic where clause to include only soft deleted records
export const onlyDeleted = {
  deletedAt: { not: null }
} as const

// Helper function to create soft delete where clause
export function createSoftDeleteWhere<T extends Record<string, any>>(
  where: T = {} as T,
  includeDeleted = false
): T & { deletedAt?: any } {
  if (includeDeleted) {
    return where
  }
  
  return {
    ...where,
    deletedAt: null
  }
}

// Helper function to soft delete a record
export function softDelete() {
  return {
    deletedAt: new Date()
  }
}

// Helper function to restore a soft deleted record
export function restoreRecord() {
  return {
    deletedAt: null
  }
}

// Types for queries that might include deleted records
export type QueryWithDeleted<T> = T & {
  includeDeleted?: boolean
}
