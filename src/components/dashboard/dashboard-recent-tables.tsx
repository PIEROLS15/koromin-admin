"use client";

import Link from "next/link";

import { PlatformDataTable, type PlatformTableColumn } from "@/components/data-table/platform-data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/dashboard/metrics";
import type { DashboardOrder, DashboardSale } from "@/lib/dashboard/types";
import { currency } from "@/lib/money/format";

const salesColumns: PlatformTableColumn<DashboardSale>[] = [
  { id: "code", header: "Código", value: (sale) => sale.code, sortable: true, className: "font-medium", cell: (sale) => sale.code },
  { id: "customer", header: "Cliente", value: (sale) => sale.customer, sortable: true, cell: (sale) => sale.customer },
  { id: "date", header: "Fecha", value: (sale) => sale.date, sortable: true, cell: (sale) => formatDate(sale.date) },
  { id: "total", header: "Total", value: (sale) => sale.total, sortable: true, align: "right", cell: (sale) => currency(sale.total) },
  { id: "profit", header: "Ganancia", value: (sale) => sale.profit, sortable: true, align: "right", className: "text-success", cell: (sale) => currency(sale.profit) },
];

const ordersColumns: PlatformTableColumn<DashboardOrder>[] = [
  { id: "code", header: "Código", value: (order) => order.code, sortable: true, cell: (order) => <Link href={`/pedidos/${order.id}`} className="font-medium text-primary hover:underline">{order.code}</Link> },
  { id: "supplier", header: "Proveedor", value: (order) => order.supplier, sortable: true, cell: (order) => order.supplier },
  { id: "date", header: "Fecha", value: (order) => order.date, sortable: true, cell: (order) => formatDate(order.date) },
  { id: "units", header: "Productos", value: (order) => order.units, sortable: true, align: "right", cell: (order) => `${order.units} u.` },
  { id: "total", header: "Inversión", value: (order) => order.total, sortable: true, align: "right", cell: (order) => currency(order.total) },
  { id: "status", header: "Estado", value: (order) => order.status, sortable: true, cell: (order) => order.status },
];

export function DashboardRecentTables({ sales, orders }: { sales: DashboardSale[]; orders: DashboardOrder[] }) {
  const recentSales = [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const recentOrders = [...orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <section className="mt-6 grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader className="flex items-start justify-between gap-3 space-y-0">
          <div><CardTitle>Ventas recientes</CardTitle><CardDescription>Últimas ventas registradas</CardDescription></div>
          <Button variant="outline" size="sm" asChild><Link href="/ventas">Ver todas</Link></Button>
        </CardHeader>
        <CardContent>
          <PlatformDataTable data={recentSales} columns={salesColumns} rowKey={(sale) => sale.id} entity={{ singular: "venta", plural: "ventas" }} initialSort={{ id: "date", dir: "desc" }} minWidth="760px" emptyLabel="Sin ventas registradas." showFooter={false} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex items-start justify-between gap-3 space-y-0">
          <div><CardTitle>Pedidos recientes</CardTitle><CardDescription>Últimas compras registradas a proveedores</CardDescription></div>
          <Button variant="outline" size="sm" asChild><Link href="/pedidos">Ver todos</Link></Button>
        </CardHeader>
        <CardContent>
          <PlatformDataTable data={recentOrders} columns={ordersColumns} rowKey={(order) => order.id} entity={{ singular: "pedido", plural: "pedidos" }} initialSort={{ id: "date", dir: "desc" }} minWidth="860px" emptyLabel="Sin pedidos registrados." showFooter={false} />
        </CardContent>
      </Card>
    </section>
  );
}
