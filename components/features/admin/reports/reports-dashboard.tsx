"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDailySalesReportAction,
  getSalesByProductAction,
  getSalesByUserAction,
} from "@/lib/actions/reportsActions";
import type {
  DailySalesReportRow,
  ProductSalesReportRow,
  UserSalesReportRow,
} from "@/lib/datasources/reports.datasource";
import { SaleStatus } from "@prisma/client";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  BarChart3,
  ChevronLeft,
  Loader2,
  RefreshCcw,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const STATUS_LABELS: Record<SaleStatus, string> = {
  COMPLETED: "Completada",
  PENDING: "Pendiente",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

interface ReportsDashboardProps {
  onBack?: () => void;
}

interface ReportsFiltersState {
  year: number;
  month: number;
  statuses: SaleStatus[];
  productLimit: number;
  userLimit: number;
}

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const buildRangeDate = (year: number, month: number) => {
  const monthIndex = month - 1;
  const from = new Date(year, monthIndex, 1)
    .toISOString()
    .slice(0, 10);
  const to = new Date(year, month, 0).toISOString().slice(0, 10);
  return { from, to };
};

export function ReportsDashboard({ onBack }: ReportsDashboardProps) {
  const { permissions, isAuthenticated, isLoading } = useAuth();
  const [filters, setFilters] = useState<ReportsFiltersState>(() => {
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      statuses: [],
      productLimit: 5,
      userLimit: 5,
    };
  });
  const [dailyReport, setDailyReport] = useState<DailySalesReportRow[]>([]);
  const [productsReport, setProductsReport] = useState<ProductSalesReportRow[]>([]);
  const [usersReport, setUsersReport] = useState<UserSalesReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canViewReports = useMemo(
    () =>
      permissions.includes("reports:manage") ||
      permissions.includes("reports:view"),
    [permissions]
  );

  const toggleStatus = (status: SaleStatus) => {
    setFilters((prev) => {
      const exists = prev.statuses.includes(status);
      return {
        ...prev,
        statuses: exists
          ? prev.statuses.filter((item) => item !== status)
          : [...prev.statuses, status],
      };
    });
  };

  const refreshReports = useCallback(async () => {
    if (!canViewReports) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { from, to } = buildRangeDate(filters.year, filters.month);
      const statusPayload = filters.statuses.length ? filters.statuses : undefined;

      const [daily, products, users] = await Promise.all([
        getDailySalesReportAction({
          year: filters.year,
          month: filters.month,
          status: statusPayload,
          checkoutId: undefined,
          userId: undefined,
          customerId: undefined,
        }),
        getSalesByProductAction({
          status: statusPayload,
          from,
          to,
          limit: filters.productLimit,
        }),
        getSalesByUserAction({
          status: statusPayload,
          from,
          to,
          limit: filters.userLimit,
        }),
      ]);

      setDailyReport(daily ?? []);
      setProductsReport(products ?? []);
      setUsersReport(users ?? []);
    } catch (caught) {
      console.error("Error loading reports", caught);
      setError("No se pudieron cargar los reportes. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [canViewReports, filters.month, filters.productLimit, filters.statuses, filters.userLimit, filters.year]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !canViewReports) {
      return;
    }
    refreshReports();
  }, [refreshReports, isAuthenticated, isLoading, canViewReports]);

  const summary = useMemo(() => {
    if (!dailyReport.length) {
      return {
        total: 0,
        averageTicket: 0,
        saleCount: 0,
        bestDay: null as DailySalesReportRow | null,
      };
    }

    const total = dailyReport.reduce((acc, row) => acc + row.total, 0);
    const saleCount = dailyReport.reduce((acc, row) => acc + row.saleCount, 0);
    const averageTicket = saleCount > 0 ? total / saleCount : 0;
    const bestDay = dailyReport.reduce((best, current) =>
      !best || current.total > best.total ? current : best,
      null as DailySalesReportRow | null
    );

    return {
      total,
      averageTicket,
      saleCount,
      bestDay,
    };
  }, [dailyReport]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!canViewReports) {
    return (
      <Card className="flex flex-1 flex-col items-center justify-center p-10 text-center text-muted-foreground">
        <AlertCircle className="mb-4 h-10 w-10 text-orange-500" />
        <p>No tienes permisos para ver los reportes.</p>
        {onBack ? (
          <Button variant="outline" className="mt-4" onClick={onBack}>
            Volver
          </Button>
        ) : null}
      </Card>
    );
  }

  const selectedMonthLabel = `${MONTHS[filters.month - 1]} ${filters.year}`;

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {onBack ? (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : null}
            <h1 className="text-2xl font-semibold text-orange-500">
              Reportes de ventas
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Resumen consolidado de ventas, productos destacados y rendimiento del equipo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshReports}
            disabled={loading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <Label>Año</Label>
            <Input
              type="number"
              min={2020}
              max={9999}
              value={filters.year}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  year: Number(event.target.value) || prev.year,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Mes</Label>
            <Select
              value={String(filters.month)}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  month: Number(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((label, index) => (
                  <SelectItem key={label} value={String(index + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estados de venta</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.statuses.length
                    ? `${filters.statuses.length} seleccionados`
                    : "Solo completadas"}
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {(Object.values(SaleStatus) as SaleStatus[]).map((status) => (
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
            <Label>Top productos</Label>
            <Select
              value={String(filters.productLimit)}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  productLimit: Number(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20].map((limit) => (
                  <SelectItem key={limit} value={String(limit)}>
                    Top {limit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Top usuarios</Label>
            <Select
              value={String(filters.userLimit)}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  userLimit: Number(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20].map((limit) => (
                  <SelectItem key={limit} value={String(limit)}>
                    Top {limit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-destructive/60 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total del periodo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-10 w-10 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold">
                  {formatCurrency(summary.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedMonthLabel}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-10 w-10 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold">
                  {formatCurrency(summary.averageTicket)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.saleCount} ventas en total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mejor día
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary.bestDay ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-orange-500" />
                  <span className="font-semibold">
                    {summary.bestDay.date}
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(summary.bestDay.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.bestDay.saleCount} ventas - Ticket promedio {" "}
                  {formatCurrency(summary.bestDay.averageTicket)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no hay datos para este periodo.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Ventas diarias ({selectedMonthLabel})
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            {loading && !dailyReport.length ? (
              <div className="flex h-72 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
              </div>
            ) : (
              <ChartContainer
                config={{
                  total: {
                    label: "Total diario",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-72"
              >
                <LineChart data={dailyReport}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) =>
                      Number(value).toLocaleString("es-PY")
                    }
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="total" />}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Estados aplicados
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {filters.statuses.length ? (
              filters.statuses.map((status) => (
                <Badge key={status} variant="secondary">
                  {STATUS_LABELS[status]}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">Solo completadas</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Productos más vendidos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-[280px] pr-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsReport.length ? (
                    productsReport.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {product.name ?? "Sin nombre"}
                            </span>
                            {product.barcode ? (
                              <span className="text-xs text-muted-foreground">
                                {product.barcode}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {product.quantity.toLocaleString("es-PY")}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(product.total)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No hay ventas registradas para el periodo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Ventas por usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-[280px] pr-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-right">Ventas</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersReport.length ? (
                    usersReport.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {user.name} {user.lastname}
                            </span>
                            {user.email ? (
                              <span className="text-xs text-muted-foreground">
                                {user.email}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {user.saleCount.toLocaleString("es-PY")}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(user.total)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        No hay ventas registradas para el periodo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
