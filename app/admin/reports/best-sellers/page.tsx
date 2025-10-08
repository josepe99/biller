"use client";

import type { ProductSalesReportRow } from "@/lib/datasources/reports.datasource";
import { generateProductSalesReportPDF } from "@/lib/actions/pdf.actions";
import { getSalesByProductAction } from "@/lib/actions/reportsActions";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  BarChart3,
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
  productId?: string;
}

export default function BestSellersReportPage() {
  const { toast } = useToast();
  const [data, setData] = useState<ProductSalesReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    limit: "10",
    status: [SaleStatus.COMPLETED],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const reportData = await getSalesByProductAction({
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
        productId: filters.productId || undefined,
      });
      setData(reportData);
    } catch (error) {
      console.error("Error loading best sellers report:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte de productos más vendidos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  const handleDownloadPDF = useCallback(async () => {
    setIsDownloading(true);
    try {
      const result = await generateProductSalesReportPDF({
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
        productId: filters.productId || undefined,
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
                <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                Productos más vendidos
              </h1>
              <p className="text-gray-600 mt-1">
                Reporte de los productos con mayor volumen de ventas
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
              {data.length} producto(s) encontrado(s)
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
                      <TableHead>Producto</TableHead>
                      <TableHead>Código de Barras</TableHead>
                      <TableHead className="text-right">
                        Cantidad Vendida
                      </TableHead>
                      <TableHead className="text-right">
                        Total Vendido
                      </TableHead>
                      <TableHead className="text-right">
                        Precio Promedio
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name || "Producto sin nombre"}
                        </TableCell>
                        <TableCell>{item.barcode || "Sin código"}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.averageUnitPrice)}
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
