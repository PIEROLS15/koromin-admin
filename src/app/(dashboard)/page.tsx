import { Boxes, Coins, PackageCheck, Receipt, TrendingUp, Truck } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency } from "@/lib/money/format";

export default function DashboardPage() {
  const stats = [
    { title: "Inversión total", value: currency(0), icon: Coins, tone: "primary" as const },
    { title: "Ventas totales", value: currency(0), icon: Receipt, tone: "gold" as const },
    { title: "Ganancia total", value: currency(0), icon: TrendingUp, tone: "success" as const },
    { title: "Productos en stock", value: "0", icon: Boxes, tone: "info" as const },
    { title: "Productos vendidos", value: "0", icon: PackageCheck, tone: "primary" as const },
    { title: "Pedidos/en camino", value: "0", icon: Truck, tone: "gold" as const },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen del negocio: inversión, ventas, ganancias, inventario y pedidos recientes."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por mes</CardTitle>
            <CardDescription>Preparado para filtros independientes por gráfico.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid h-72 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">
              Conecta Prisma para renderizar Recharts con datos reales.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pedidos recientes</CardTitle>
            <CardDescription>Los estados se actualizarán al recibir inventario.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Aún no hay pedidos registrados.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
