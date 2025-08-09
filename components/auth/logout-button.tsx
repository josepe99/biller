'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/lib/actions/auth'
import { useAuth } from './auth-provider'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default', 
  className = '',
  showIcon = true,
  children 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { clearAuth } = useAuth()

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      // Clear auth context and localStorage first
      clearAuth()
      
      // Call server action to invalidate session
      await logoutAction()
      
      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect to login even if there's an error
      window.location.href = '/login'
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {children || (isLoading ? 'Signing out...' : 'Logout')}
    </Button>
  )
}
