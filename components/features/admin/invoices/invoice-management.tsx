"use client"

import { useAuth } from '@/components/auth/auth-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getInvoiceCashiersAction, getInvoicesAction } from '@/lib/actions/saleActions'
import type { InvoiceCashierOption, InvoiceListItem, InvoiceStatus } from '@/lib/types/invoices'
import { INVOICE_STATUS_OPTIONS } from '@/lib/types/invoices'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, Filter, Loader2, RefreshCcw, Search } from 'lucide-react'

interface InvoiceManagementProps {
  standalone?: boolean
}

const PAGE_SIZE = 20

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

const STATUS_BADGE_VARIANT: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  COMPLETED: 'default',
  PENDING: 'secondary',
  CANCELLED: 'destructive',
  REFUNDED: 'outline',
}

const initialFilters = {
  cashierId: null as string | null,
  statuses: [] as InvoiceStatus[],
  dateFrom: null as string | null,
  dateTo: null as string | null,
  minTotal: null as number | null,
  maxTotal: null as number | null,
  search: '',
}

type FiltersState = typeof initialFilters

function formatCurrency(value: number) {
  return value.toLocaleString('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return date.toLocaleString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function InvoiceManagement({ standalone }: InvoiceManagementProps) {
  const { permissions } = useAuth()
  const router = useRouter()
  const canRead = permissions.includes('sales:manage') || permissions.includes('sales:read')

  const [filters, setFilters] = useState<FiltersState>(initialFilters)
  const [cashiers, setCashiers] = useState<InvoiceCashierOption[]>([])
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const totalPages = useMemo(() => {
    if (totalCount === 0) {
      return 1
    }
    return Math.max(Math.ceil(totalCount / PAGE_SIZE), 1)
  }, [totalCount])

  const pageRange = useMemo(() => {
    if (totalCount === 0) {
      return { from: 0, to: 0 }
    }
    const from = (page - 1) * PAGE_SIZE + 1
    const to = Math.min(page * PAGE_SIZE, totalCount)
    return { from, to }
  }, [page, totalCount])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setPage(1)
  }, [])

  const toggleStatus = useCallback((status: InvoiceStatus) => {
    setFilters((prev) => {
      const exists = prev.statuses.includes(status)
      const nextStatuses = exists
        ? prev.statuses.filter((item) => item !== status)
        : [...prev.statuses, status]
      return { ...prev, statuses: nextStatuses }
    })
    setPage(1)
  }, [])

  const updateFilter = useCallback(<K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
    setPage(1)
  }, [])

  useEffect(() => {
    if (!canRead) {
      return
    }

    let active = true
    getInvoiceCashiersAction()
      .then((data) => {
        if (active) {
          setCashiers(data)
        }
      })
      .catch(() => {
        if (active) {
          setCashiers([])
        }
      })

    return () => {
      active = false
    }
  }, [canRead])

  useEffect(() => {
    if (!canRead) {
      setLoading(false)
      setInvoices([])
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    const query = {
      cashierId: filters.cashierId || undefined,
      statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      minTotal: filters.minTotal ?? undefined,
      maxTotal: filters.maxTotal ?? undefined,
      search: filters.search && filters.search.trim().length > 0 ? filters.search.trim() : undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }

    getInvoicesAction(query)
      .then((response) => {
        if (!active) {
          return
        }
        setInvoices(response.invoices)
        setTotalCount(response.totalCount)
      })
      .catch(() => {
        if (active) {
          setError('Error al cargar las facturas. Intenta de nuevo.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [canRead, filters, page])

  const handleRefresh = () => {
    setPage(1)
    setFilters((prev) => ({ ...prev }))
  }

  const renderContent = () => {
    if (!canRead) {
      return <p className="text-sm text-muted-foreground">No tienes permiso para ver las facturas.</p>
    }

    if (error) {
      return <p className="text-sm text-red-500">{error}</p>
    }

    if (!loading && invoices.length === 0) {
      return <p className="text-sm text-muted-foreground">No hay facturas para los filtros seleccionados.</p>
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Factura</TableHead>
              <TableHead>Cajero</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Caja</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell colSpan={7} className="py-6">
                      <div className="flex items-center justify-center text-muted-foreground text-sm">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando facturas...
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : invoices.map((invoice) => (
                  <TableRow key={invoice.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/${encodeURIComponent(invoice.saleNumber)}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        router.push(`/${encodeURIComponent(invoice.saleNumber)}`);
                      }
                    }}
                    className="hover:bg-muted cursor-pointer"
                  >
                    <TableCell className="font-medium">{invoice.saleNumber}</TableCell>
                    <TableCell>
                      {invoice.cashier.name}
                      {invoice.cashier.lastname ? ` ${invoice.cashier.lastname}` : ''}
                    </TableCell>
                    <TableCell>
                      {invoice.customer?.name || '-'}
                      {invoice.customer?.ruc ? (
                        <span className="block text-xs text-muted-foreground">RUC: {invoice.customer.ruc}</span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE_VARIANT[invoice.status]}>
                        {STATUS_LABELS[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell>{invoice.checkout?.name || '-'}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {standalone ? (
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Volver
                </Button>
              </Link>
            ) : null}
            <CardTitle>Facturas</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Search className="h-4 w-4" /> Buscar
              </span>
            </Label>
            <Input
              id="search"
              placeholder="Factura, cliente o RUC"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {filters.statuses.length > 0
                      ? `${filters.statuses.length} seleccionado${filters.statuses.length > 1 ? 's' : ''}`
                      : 'Todos'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {INVOICE_STATUS_OPTIONS.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.statuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  >
                    {STATUS_LABELS[status]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <Label>Cajero</Label>
            <Select
              value={filters.cashierId ?? 'all'}
              onValueChange={(value) => updateFilter('cashierId', value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {cashiers.map((cashier) => (
                  <SelectItem key={cashier.id} value={cashier.id}>
                    {cashier.name}
                    {cashier.lastname ? ` ${cashier.lastname}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-from">Fecha desde</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(event) => updateFilter('dateFrom', event.target.value || null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-to">Fecha hasta</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(event) => updateFilter('dateTo', event.target.value || null)}
            />
          </div>
          <div className="space-y-2">
            <Label>Monto total (mínimo)</Label>
            <Input
              type="number"
              min={0}
              value={filters.minTotal ?? ''}
              onChange={(event) => {
                const value = event.target.value
                updateFilter('minTotal', value === '' ? null : Number(value))
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Monto total (máximo)</Label>
            <Input
              type="number"
              min={0}
              value={filters.maxTotal ?? ''}
              onChange={(event) => {
                const value = event.target.value
                updateFilter('maxTotal', value === '' ? null : Number(value))
              }}
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={resetFilters} disabled={loading} className="w-full">
              Limpiar filtros
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {pageRange.from}-{pageRange.to} de {totalCount} factura{totalCount === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
            >
              Anterior
            </Button>
            <span>
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages || loading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {renderContent()}
      </CardContent>
    </Card>
  )
}
