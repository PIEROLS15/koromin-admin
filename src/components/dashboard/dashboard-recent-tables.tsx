import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/dashboard/metrics";
import type { DashboardOrder, DashboardSale } from "@/lib/dashboard/types";
import { currency } from "@/lib/money/format";

export function DashboardRecentTables({ sales, orders }: { sales: DashboardSale[]; orders: DashboardOrder[] }) {
  const recentSales = [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const recentOrders = [...orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <section className="mt-6 grid gap-4 xl:grid-cols-2">
      <Card><CardHeader className="flex items-start justify-between gap-3 space-y-0"><div><CardTitle>Ventas recientes</CardTitle><CardDescription>Últimas ventas registradas</CardDescription></div><Button variant="outline" size="sm" asChild><Link href="/ventas">Ver todas</Link></Button></CardHeader><CardContent><div className="overflow-hidden rounded-lg border"><Table><TableHeader className="bg-muted/40"><TableRow><TableHead>Código</TableHead><TableHead>Cliente</TableHead><TableHead>Fecha</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Ganancia</TableHead></TableRow></TableHeader><TableBody>{recentSales.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Sin ventas registradas.</TableCell></TableRow>}{recentSales.map((sale) => <TableRow key={sale.id}><TableCell className="font-medium">{sale.code}</TableCell><TableCell>{sale.customer}</TableCell><TableCell>{formatDate(sale.date)}</TableCell><TableCell className="text-right tabular-nums">{currency(sale.total)}</TableCell><TableCell className="text-right tabular-nums text-success">{currency(sale.profit)}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
      <Card><CardHeader className="flex items-start justify-between gap-3 space-y-0"><div><CardTitle>Pedidos recientes</CardTitle><CardDescription>Últimas compras registradas a proveedores</CardDescription></div><Button variant="outline" size="sm" asChild><Link href="/pedidos">Ver todos</Link></Button></CardHeader><CardContent><div className="overflow-x-auto rounded-lg border"><Table><TableHeader className="bg-muted/40"><TableRow><TableHead>Código</TableHead><TableHead>Proveedor</TableHead><TableHead>Fecha</TableHead><TableHead className="text-right">Productos</TableHead><TableHead className="text-right">Inversión</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>{recentOrders.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Sin pedidos registrados.</TableCell></TableRow>}{recentOrders.map((order) => <TableRow key={order.id}><TableCell><Link href={`/pedidos/${order.id}`} className="font-medium text-primary hover:underline">{order.code}</Link></TableCell><TableCell>{order.supplier}</TableCell><TableCell>{formatDate(order.date)}</TableCell><TableCell className="text-right tabular-nums">{order.units} u.</TableCell><TableCell className="text-right tabular-nums">{currency(order.total)}</TableCell><TableCell>{order.status}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
    </section>
  );
}
