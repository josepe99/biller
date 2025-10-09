"use client";

import type { UserSalesReportRow } from "@/lib/datasources/reports.datasource";
import { generateUserSalesReportPDF } from "@/lib/actions/pdf.actions";
import { getSalesByUserAction } from "@/lib/actions/reportsActions";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useCallback, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SaleStatus } from "@prisma/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Download,
  Loader2,
  RefreshCcw,
  Filter,
  Users,
  Trophy,
  TrendingUp,
} from "lucide-react";

const STATUS_LABELS: Record<SaleStatus, string> = {
  COMPLETED: "Completada",
  PENDING: "Pendiente",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

interface FiltersState {
  from?: string;
  to?: string;
  limit: string;
  status: SaleStatus[];
  checkoutId?: string;
  userId?: string;
  customerId?: string;
}

export default function TopCashiersReportPage() {
  const { toast } = useToast();
  const [data, setData] = useState<UserSalesReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    limit: "10",
    status: [SaleStatus.COMPLETED],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const reportData = await getSalesByUserAction({
        from: filters.from || undefined,
        to: filters.to || undefined,
        limit:
          filters.limit && filters.limit !== "all"
            ? parseInt(filters.limit)
            : undefined,
        status: filters.status,
        checkoutId: filters.checkoutId || undefined,
        userId: filters.userId || undefined,
        customerId: filters.customerId || undefined,
      });
      setData(reportData);
    } catch (error) {
      console.error("Error loading top cashiers report:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte de cajeros con más ventas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);
    try {
      const result = await generateUserSalesReportPDF({
        from: filters.from || undefined,
        to: filters.to || undefined,
        limit:
          filters.limit && filters.limit !== "all"
            ? parseInt(filters.limit)
            : undefined,
        status: filters.status,
        checkoutId: filters.checkoutId || undefined,
        userId: filters.userId || undefined,
        customerId: filters.customerId || undefined,
      });

      // Create download link
      const link = document.createElement("a");
      link.href = result.dataUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Éxito",
        description: "El reporte PDF se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar el reporte PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [filters, toast]);

  const handleStatusChange = useCallback(
    (status: SaleStatus, checked: boolean) => {
      setFilters((prev) => ({
        ...prev,
        status: checked
          ? [...prev.status, status]
          : prev.status.filter((s) => s !== status),
      }));
    },
    []
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("es-PY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/admin/reports">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Reportes
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="h-8 w-8 mr-3 text-green-600" />
                Cajeros con más ventas
              </h1>
              <p className="text-gray-600 mt-1">
                Ranking de cajeros por volumen de ventas
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading || data.length === 0}
              size="sm"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Descargar PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="from-date">Fecha desde</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={filters.from || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, from: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="to-date">Fecha hasta</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={filters.to || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, to: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="limit">Límite</Label>
                <Select
                  value={filters.limit}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, limit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Top 5</SelectItem>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="20">Top 20</SelectItem>
                    <SelectItem value="50">Top 50</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado de ventas</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {filters.status.length} seleccionado(s)
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <DropdownMenuCheckboxItem
                        key={value}
                        checked={filters.status.includes(value as SaleStatus)}
                        onCheckedChange={(checked) =>
                          handleStatusChange(value as SaleStatus, checked)
                        }
                      >
                        {label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-end">
                <Button onClick={loadData} className="w-full">
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados del Reporte</CardTitle>
            <CardDescription>
              {data.length} cajero(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando datos...</span>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron datos para los filtros seleccionados
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posición</TableHead>
                      <TableHead>Cajero</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Nº de Ventas</TableHead>
                      <TableHead className="text-right">
                        Total Vendido
                      </TableHead>
                      <TableHead className="text-right">
                        Ticket Promedio
                      </TableHead>
                      <TableHead className="text-right">Última Venta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={item.userId}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getRankIcon(index + 1)}
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {`${item.name} ${item.lastname}`.trim()}
                        </TableCell>
                        <TableCell>{item.email || "Sin email"}</TableCell>
                        <TableCell className="text-right">
                          {item.saleCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.averageTicket)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDate(item.lastSaleAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
