import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency } from "@/lib/money/format";
import { getOrderTotal } from "@/server/orders/queries";
import { formatDate } from "@/server/shared/format";

export function OrdersTable({ orders }: { orders: Array<Parameters<typeof getOrderTotal>[0] & { id: string; code: string; status: string; orderDate: Date; supplier: { name: string } }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Proveedor</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Link href={`/pedidos/${order.id}`} className="font-medium text-primary hover:underline">
                {order.code}
              </Link>
            </TableCell>
            <TableCell>{order.supplier.name}</TableCell>
            <TableCell>{order.status}</TableCell>
            <TableCell>{formatDate(order.orderDate)}</TableCell>
            <TableCell className="text-right tabular-nums">{currency(getOrderTotal(order))}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
