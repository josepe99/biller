import { LoginForm } from '@/components/auth/login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Biller',
  description: 'Sign in to access the POS system',
}

export default function LoginPage() {
  return <LoginForm />
}
