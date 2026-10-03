import Link from "next/link";

import { OrdersTable } from "@/components/orders/orders-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { getOrderList } from "@/server/orders/queries";

export default async function OrdersPage() {
  await requirePermission("orders.manage");
  const orders = await getOrderList();

  return (
    <>
      <PageHeader title="Pedidos" description="Compras a proveedores, costos, aportes y recepción de inventario." actions={<Button asChild><Link href="/pedidos/nuevo">Nuevo pedido</Link></Button>} />
      <Card>
        <CardHeader>
          <CardTitle>Últimos pedidos</CardTitle>
          <CardDescription>Mostrando hasta 50 registros.</CardDescription>
        </CardHeader>
        <CardContent><OrdersTable orders={orders} /></CardContent>
      </Card>
    </>
  );
}
