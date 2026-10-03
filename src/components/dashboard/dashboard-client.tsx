"use client";

import dynamic from "next/dynamic";

import { DashboardRecentTables } from "@/components/dashboard/dashboard-recent-tables";
import type { DashboardInventory, DashboardOrder, DashboardSale } from "@/lib/dashboard/types";

const DashboardCharts = dynamic(() => import("@/components/dashboard/dashboard-charts").then((mod) => mod.DashboardCharts), {
  ssr: false,
  loading: () => <div className="mt-6 grid h-72 place-items-center rounded-xl border text-sm text-muted-foreground">Cargando gráficos...</div>,
});

export interface DashboardClientProps {
  sales: DashboardSale[];
  orders: DashboardOrder[];
  inventory: DashboardInventory;
}

export function DashboardClient({ sales, orders, inventory }: DashboardClientProps) {
  return (
    <>
      <DashboardCharts sales={sales} orders={orders} inventory={inventory} />
      <DashboardRecentTables sales={sales} orders={orders} />
    </>
  );
}
