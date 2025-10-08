import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, TrendingUp, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

const reportItems = [
  {
    title: "Productos más vendidos",
    description: "Reporte de los productos con mayor volumen de ventas",
    href: "/admin/reports/best-sellers",
    icon: BarChart3,
    color: "text-blue-600",
  },
  {
    title: "Cajeros con más ventas",
    description: "Ranking de cajeros por volumen de ventas",
    href: "/admin/reports/top-cashiers",
    icon: Users,
    color: "text-green-600",
  },
];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-2">
            Accede a los diferentes reportes del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportItems.map((report) => {
            const IconComponent = report.icon;
            return (
              <Card key={report.href} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-6 w-6 ${report.color}`} />
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href={report.href}>
                    <Button className="w-full" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Reporte
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
