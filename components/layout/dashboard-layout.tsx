'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock } from '@/components/ui/clock'
import { LayoutDashboard, ShoppingCart, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { sampleProducts } from '@/lib/data/sample-data'
import { SessionValidator } from '@/components/auth/session-validator'
import { LogoutButton } from '@/components/auth/logout-button'
import { getLowStockCountAction } from '@/lib/actions/products'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  const [lowStockCount, setLowStockCount] = useState(0)

  useEffect(() => {
    const fetchLowStockCount = async () => {
      const lowStockCount = await getLowStockCountAction()
      setLowStockCount(lowStockCount)
    }

    fetchLowStockCount()
  }, [])

  const getActiveModule = () => {
    if (pathname.includes('/admin')) return 'admin'
    if (pathname.includes('/stock')) return 'inventory'
    return 'billing'
  }

  const activeModule = getActiveModule()

  return (
    <>
      <SessionValidator />
      <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-20 bg-white border-r shadow-md flex flex-col items-center py-6 space-y-6">
        <div className="mb-6">
          <Image src="/placeholder.svg?height=40&width=40" alt="POS Logo" width={40} height={40} />
        </div>
        <nav className="flex flex-col items-center space-y-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${activeModule === 'billing' ? 'bg-orange-100 text-orange-700' : ''}`}
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs mt-1">Facturar</span>
            </Button>
          </Link>
          <Link href="/stock">
            <Button
              variant="ghost"
              size="icon"
              className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${activeModule === 'inventory' ? 'bg-orange-100 text-orange-700' : ''}`}
            >
              <Package className="h-6 w-6" />
              <span className="text-xs mt-1">Stock</span>
              {lowStockCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-xs">
                  {lowStockCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/admin">
            <Button
              variant="ghost"
              size="icon"
              className={`relative h-14 w-14 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100 ${activeModule === 'admin' ? 'bg-orange-100 text-orange-700' : ''}`}
            >
              <LayoutDashboard className="h-6 w-6" />
              <span className="text-xs mt-1">Admin</span>
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <Image src="/placeholder.svg?height=30&width=30" alt="POS Icon" width={30} height={30} />
            <h1 className="text-xl font-semibold text-orange-500">Biller</h1>
          </div>
          <div className="flex items-center space-x-4 text-gray-600">
            <Clock showDate={true} />
            <LogoutButton 
              variant="outline" 
              size="sm" 
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              Cerrar Sesión
            </LogoutButton>
          </div>
        </header>

        {/* Module Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
    </>
  )
}
