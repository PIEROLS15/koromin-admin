import Link from "next/link";

import { PaginationControls } from "@/components/data-table/pagination";
import { TableSearchForm } from "@/components/data-table/search-form";
import { OrdersTable } from "@/components/orders/orders-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { getOrderList } from "@/server/orders/queries";
import { parseListParams } from "@/server/shared/pagination";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("orders.manage");
  const params = parseListParams(await searchParams);
  const orders = await getOrderList(params);

  return (
    <>
      <PageHeader title="Pedidos" description="Compras a proveedores, costos, aportes y recepción de inventario." actions={<Button asChild><Link href="/pedidos/nuevo">Nuevo pedido</Link></Button>} />
      <Card>
        <CardHeader>
          <CardTitle>Últimos pedidos</CardTitle>
          <CardDescription>Filtra y navega pedidos por código o proveedor.</CardDescription>
        </CardHeader>
        <CardContent>
          <TableSearchForm q={params.q} placeholder="Buscar por código o proveedor" />
          <OrdersTable orders={orders.rows} />
          <PaginationControls result={orders} basePath="/pedidos" q={params.q} />
        </CardContent>
      </Card>
    </>
  );
}
