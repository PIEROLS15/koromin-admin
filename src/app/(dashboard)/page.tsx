import { Boxes, Coins, PackageCheck, Receipt, TrendingUp, Truck } from "lucide-react";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { DashboardRecentTables } from "@/components/dashboard/dashboard-recent-tables";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { getDashboardData } from "@/server/dashboard/get-dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { sales, orders, inventory, stats: dashboardStats } = await getDashboardData();
  const stats = [
    { title: "Inversión total", value: dashboardStats.totalInvestment, icon: Coins, tone: "primary" as const },
    { title: "Ventas totales", value: dashboardStats.totalSales, icon: Receipt, tone: "gold" as const },
    { title: "Ganancia total", value: dashboardStats.totalProfit, icon: TrendingUp, tone: "success" as const },
    { title: "Productos en stock", value: dashboardStats.inStock, icon: Boxes, tone: "info" as const },
    { title: "Productos vendidos", value: dashboardStats.sold, icon: PackageCheck, tone: "primary" as const },
    { title: "Pedidos/en camino", value: dashboardStats.ordered, icon: Truck, tone: "gold" as const },
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
      <DashboardClient sales={sales} orders={orders} inventory={inventory} />
      <DashboardRecentTables sales={sales} orders={orders} />
    </>
  );
}
