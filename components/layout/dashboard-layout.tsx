'use client'

import { SessionValidator } from '@/components/auth/session-validator'
import { getLowStockCountAction } from '@/lib/actions/productActions'
import { LayoutDashboard, ShoppingCart, Package } from 'lucide-react'
import { LogoutButton } from '@/components/auth/logout-button'
import { Button } from '@/components/ui/button'
import { Clock } from '@/components/ui/clock'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import OpenCashRegisterModal from './OpenCashRegisterModal'
import { openCheckout, getActiveCashRegisters } from '@/lib/actions/cashRegisterActions'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { LOGO } from '@/settings'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { permissions } = useAuth()

  const [lowStockCount, setLowStockCount] = useState(0)
  const { user } = useAuth();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [cashRegister, setCashRegister] = useState<any>(null);

  // Obtener estado de caja al cargar
  useEffect(() => {
    const fetchActiveCash = async () => {
      try {
        const actives = await getActiveCashRegisters();
        setCashRegister(Array.isArray(actives) && actives.length > 0 ? actives[0] : null);
      } catch {
        setCashRegister(null);
      }
    };
    fetchActiveCash();
  }, []);

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
          <Image src={LOGO} alt="Biller Logo" width={40} height={40} />
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
          {permissions.includes('inventory:manage') && (
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
          )}
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
            <Image src={LOGO} alt="POS Icon" width={25} height={25} />
            <h1 className="text-xl font-semibold text-orange-500">Biller</h1>
          </div>
          <div className="flex items-center space-x-4 text-gray-600">
            {!cashRegister ? (
              <>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white" size="sm" onClick={() => setIsOpenModal(true)}>
                  Abrir caja
                </Button>
                <span>
                  <Badge variant="destructive">Caja cerrada</Badge>
                </span>
              </>
            ) : (
              <span>
                <Badge variant="default">Caja abierta</Badge>
              </span>
            )}
            <OpenCashRegisterModal
              open={isOpenModal}
              onOpenChange={setIsOpenModal}
              loading={loadingOpen}
              onSubmit={async ({ initialCash, openingNotes }) => {
                setLoadingOpen(true);
                try {
                  if (!user) throw new Error('Usuario no autenticado');
                  const params = {
                    checkoutId: 'main',
                    openedById: user.id,
                    initialCash,
                    openingNotes,
                    openedAt: new Date(),
                  };
                  const result = await openCheckout(params);
                  setCashRegister(result);
                  setIsOpenModal(false);
                } catch (e) {
                  alert('Error al abrir caja');
                } finally {
                  setLoadingOpen(false);
                }
              }}
            />
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
