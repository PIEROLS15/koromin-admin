import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { receiveOrderFormAction } from "@/actions/orders/receive-order";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/guards";
import { currency } from "@/lib/money/format";
import { getOrderDetail, getOrderTotal } from "@/server/orders/queries";

const statusLabel = {
  ORDER_PLACED: "Pedido realizado",
  IN_TRANSIT: "En camino",
  RECEIVED: "Recibido",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  await requirePermission("orders.manage");
  const { orderId } = await params;
  const order = await getOrderDetail(orderId);

  if (!order) notFound();

  const itemsTotal = order.items.reduce((sum, item) => sum + item.unitPurchaseCost.toNumber() * item.quantity, 0);
  const total = getOrderTotal(order);

  return (
    <>
        <PageHeader
        title={`Pedido ${order.code}`}
        description={`${order.supplier.name} · ${statusLabel[order.status]} · Total ${currency(total)}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/pedidos">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Productos del pedido</CardTitle>
          <CardDescription>Detalle real desde PostgreSQL. La recepción de inventario debe implementarse como operación transaccional separada.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Costo unitario</TableHead>
                  <TableHead className="text-right">Unidades creadas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">{currency(item.unitPurchaseCost.toNumber())}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.inventoryUnits.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Costos e inversión</CardTitle>
          <CardDescription>Resumen financiero del pedido.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Summary label="Productos" value={currency(itemsTotal)} />
          <Summary label="Delivery" value={currency(order.deliveryCost.toNumber())} />
          <Summary label="Otros costos" value={currency(order.otherCosts.toNumber())} />
          <Summary label="Total" value={currency(total)} strong />
        </CardContent>
      </Card>

      {order.status !== "RECEIVED" && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Recepción de inventario</CardTitle>
            <CardDescription>Crea las unidades físicas faltantes y marca el pedido como recibido.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={receiveOrderFormAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <Button type="submit">Recibir pedido</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function Summary({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-muted-foreground">{label}</p>
      <p className={strong ? "font-semibold text-foreground" : "font-medium"}>{value}</p>
    </div>
  );
}
