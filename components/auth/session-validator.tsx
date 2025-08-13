'use client'

import { useSessionValidation } from '@/hooks/use-session-validation'
import { useAuth } from './auth-provider'

/**
 * Session Validator Component
 * Only validates sessions for authenticated users
 * Should be used in authenticated layouts/pages
 */
export function SessionValidator() {
  useSessionValidation();
  return null; // Este componente no renderiza nada
}
