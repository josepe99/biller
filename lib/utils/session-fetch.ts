/**
 * Edge-compatible session utilities using server actions
 * This file contains functions that can be used in Edge Runtime (middleware)
 */

import { getSessionByIdAction } from '@/lib/actions/auth'
import type { AuthUser } from '../types'

/**
 * Get user by session ID using server action - Edge runtime compatible
 */
export async function getUserBySessionIdFetch(sessionId: string): Promise<AuthUser | null> {
  try {
    const result = await getSessionByIdAction(sessionId)
    
    if (!result.success || !result.user) {
      return null
    }

    return result.user
  } catch (error) {
    console.error('Error fetching session with user:', error)
    return null
  }
}
