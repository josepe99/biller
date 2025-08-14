import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoutButton } from '@/components/auth/logout-button'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unauthorized - Biller',
  description: 'You do not have permission to access this page',
}

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Unauthorized Access</CardTitle>
          <CardDescription>
            You do not have permission to access this page. Please contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-sm text-gray-600">
            <p>If you need access to this feature:</p>
            <ul className="mt-2 text-left space-y-1">
              <li>• Contact your system administrator</li>
              <li>• Verify your user role and permissions</li>
              <li>• Try logging out and back in</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/">Return to Dashboard</Link>
            </Button>
            <LogoutButton variant="outline" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
