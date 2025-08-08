import { User, UserRole } from '@prisma/client'
import { 
  userDatasource, 
  CreateUserData, 
  UpdateUserData, 
  UserFilters,
  UserSelectFields 
} from '@/lib/datasources/user.datasource'

export interface UserResponse {
  success: boolean
  data?: User | User[]
  message?: string
  error?: string
}

export class UserController {
  /**
   * Create a new user
   */
  async create(data: CreateUserData): Promise<UserResponse> {
    try {
      // Validate required fields
      if (!data.email || data.email.trim() === '') {
        return {
          success: false,
          error: 'Email is required',
        }
      }

      if (!data.name || data.name.trim() === '') {
        return {
          success: false,
          error: 'Name is required',
        }
      }

      if (!data.password || data.password.trim() === '') {
        return {
          success: false,
          error: 'Password is required',
        }
      }

      // Check if user email already exists
      const emailExists = await userDatasource.existsByEmail(data.email.trim())
      if (emailExists) {
        return {
          success: false,
          error: 'A user with this email already exists',
        }
      }

      // Create the user
      const user = await userDatasource.create({
        email: data.email.trim(),
        name: data.name.trim(),
        password: data.password,
        role: data.role || UserRole.CASHIER,
      })

      return {
        success: true,
        data: user,
        message: 'User created successfully',
      }
    } catch (error) {
      console.error('Error creating user:', error)
      return {
        success: false,
        error: 'Failed to create user',
      }
    }
  }

  /**
   * Get all users
   */
  async getAll(filters: UserFilters = {}): Promise<UserResponse> {
    try {
      const users = await userDatasource.getAll(filters)
      return {
        success: true,
        data: users,
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      return {
        success: false,
        error: 'Failed to fetch users',
      }
    }
  }

  /**
   * Get user by ID
   */
  async getById(id: string, select?: UserSelectFields): Promise<UserResponse> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      const user = await userDatasource.getById(id.trim(), select)

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        }
      }

      return {
        success: true,
        data: user,
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      return {
        success: false,
        error: 'Failed to fetch user',
      }
    }
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      if (!email || email.trim() === '') {
        return null
      }

      return await userDatasource.getByEmail(email.trim(), {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        loginAttempts: true,
        lockedUntil: true,
        lastLoginAt: true,
        deletedAt: true,
      })
    } catch (error) {
      console.error('Error finding user by email:', error)
      return null
    }
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData): Promise<UserResponse> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      // Check if user exists
      const existingUser = await userDatasource.getById(id.trim())
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
        }
      }

      // If email is being updated, check if it's already taken
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await userDatasource.existsByEmail(data.email.trim())
        if (emailExists) {
          return {
            success: false,
            error: 'A user with this email already exists',
          }
        }
      }

      const updatedUser = await userDatasource.update(id.trim(), data)

      return {
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      }
    } catch (error) {
      console.error('Error updating user:', error)
      return {
        success: false,
        error: 'Failed to update user',
      }
    }
  }

  /**
   * Soft delete user
   */
  async softDelete(id: string): Promise<UserResponse> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      // Check if user exists
      const existingUser = await userDatasource.getById(id.trim())
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
        }
      }

      if (existingUser.deletedAt) {
        return {
          success: false,
          error: 'User is already deleted',
        }
      }

      const deletedUser = await userDatasource.softDelete(id.trim())

      return {
        success: true,
        data: deletedUser,
        message: 'User deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      return {
        success: false,
        error: 'Failed to delete user',
      }
    }
  }

  /**
   * Restore soft deleted user
   */
  async restore(id: string): Promise<UserResponse> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      // Check if user exists
      const existingUser = await userDatasource.getById(id.trim())
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
        }
      }

      if (!existingUser.deletedAt) {
        return {
          success: false,
          error: 'User is not deleted',
        }
      }

      const restoredUser = await userDatasource.restore(id.trim())

      return {
        success: true,
        data: restoredUser,
        message: 'User restored successfully',
      }
    } catch (error) {
      console.error('Error restoring user:', error)
      return {
        success: false,
        error: 'Failed to restore user',
      }
    }
  }

  /**
   * Increment login attempts
   */
  async incrementLoginAttempts(id: string, lockTime?: number): Promise<UserResponse> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      const updatedUser = await userDatasource.incrementLoginAttempts(id.trim(), lockTime)

      return {
        success: true,
        data: updatedUser,
        message: 'Login attempts incremented',
      }
    } catch (error) {
      console.error('Error incrementing login attempts:', error)
      return {
        success: false,
        error: 'Failed to increment login attempts',
      }
    }
  }

  /**
   * Reset login attempts
   */
  async resetLoginAttempts(id: string): Promise<UserResponse> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      const updatedUser = await userDatasource.resetLoginAttempts(id.trim())

      return {
        success: true,
        data: updatedUser,
        message: 'Login attempts reset',
      }
    } catch (error) {
      console.error('Error resetting login attempts:', error)
      return {
        success: false,
        error: 'Failed to reset login attempts',
      }
    }
  }

  /**
   * Update login attempts and lock account if necessary
   */
  async updateLoginAttempts(id: string, attempts: number, lockTime?: number): Promise<UserResponse> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      const lockUntil = lockTime && attempts >= 5 ? new Date(Date.now() + lockTime) : undefined

      const updatedUser = await userDatasource.updateLoginAttempts(id.trim(), attempts, lockUntil)

      return {
        success: true,
        data: updatedUser,
        message: 'Login attempts updated',
      }
    } catch (error) {
      console.error('Error updating login attempts:', error)
      return {
        success: false,
        error: 'Failed to update login attempts',
      }
    }
  }

  /**
   * Update successful login
   */
  async updateSuccessfulLogin(id: string): Promise<UserResponse> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'User ID is required',
        }
      }

      const updatedUser = await userDatasource.updateSuccessfulLogin(id.trim())

      return {
        success: true,
        data: updatedUser,
        message: 'Successful login updated',
      }
    } catch (error) {
      console.error('Error updating successful login:', error)
      return {
        success: false,
        error: 'Failed to update successful login',
      }
    }
  }
}

// Export a singleton instance
export const userController = new UserController()
