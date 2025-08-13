"use server"

import { userController } from '@/lib/controllers/user.controller'
import { CreateUserData, UpdateUserData, UserFilters, UserSelectFields } from '@/lib/datasources/user.datasource'

// CREATE
export async function createUserAction(data: CreateUserData) {
  return await userController.create(data)
}

// READ ALL
export async function getAllUsersAction(filters: UserFilters = {}) {
  return await userController.getAll(filters)
}

// READ BY ID
export async function getUserByIdAction(id: string, select?: UserSelectFields) {
  return await userController.getById(id, select)
}

// UPDATE
export async function updateUserAction(id: string, data: UpdateUserData) {
  return await userController.update(id, data)
}

// SOFT DELETE
export async function softDeleteUserAction(id: string) {
  return await userController.softDelete(id)
}

// RESTORE
export async function restoreUserAction(id: string) {
  return await userController.restore(id)
}

// INCREMENT LOGIN ATTEMPTS
export async function incrementLoginAttemptsAction(id: string, lockTime?: number) {
  return await userController.incrementLoginAttempts(id, lockTime)
}

// RESET LOGIN ATTEMPTS
export async function resetLoginAttemptsAction(id: string) {
  return await userController.resetLoginAttempts(id)
}

// UPDATE LOGIN ATTEMPTS
export async function updateLoginAttemptsAction(id: string, attempts: number, lockTime?: number) {
  return await userController.updateLoginAttempts(id, attempts, lockTime)
}

// UPDATE SUCCESSFUL LOGIN
export async function updateSuccessfulLoginAction(id: string) {
  return await userController.updateSuccessfulLogin(id)
}
