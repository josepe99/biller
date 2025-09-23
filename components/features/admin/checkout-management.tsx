"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft } from 'lucide-react'
import { getAllCheckouts, getCheckoutList } from '@/lib/actions/checkoutActions'
import Link from 'next/link'


export default function CheckoutManagement() {
  const { permissions } = useAuth()
  const canRead = permissions.includes('checkout:manage') || permissions.includes('checkout:finalize') || permissions.includes('checkout:manage') || permissions.includes('cashRegister:manage') || permissions.includes('cashRegister:read')

  const [checkouts, setCheckouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    getCheckoutList()
      .then((data: any) => setCheckouts(data || []))
      .catch(() => setError('Error al cargar cajas'))
      .finally(() => setLoading(false))
  }, [])


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost">
              <ChevronLeft className="h-5 w-5 mr-1" />
              Volver al panel
            </Button>
          </Link>
          <CardTitle>Gestión de Cajas</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-8 w-10" />
              </div>
            ))}
          </div>
        ) : canRead ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkouts.map(c => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/checkouts/${c.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/admin/checkout/${c.id}`) }}
                >
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell>{c.isPrincipal ? 'Caja Principal' : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-sm text-muted-foreground">No tienes permiso para ver las cajas.</div>
        )}
      </CardContent>
    </Card>
  )
}
