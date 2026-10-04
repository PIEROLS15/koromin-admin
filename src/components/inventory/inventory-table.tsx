import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency } from "@/lib/money/format";
import { formatDate } from "@/server/shared/format";

export function InventoryTable({ units }: { units: Array<{ id: string; status: string; createdAt: Date; acquisitionCost: { toNumber: () => number }; product: { name: string }; orderItem: { order: { code: string } } }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Pedido</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Costo</TableHead>
          <TableHead>Creado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {units.map((unit) => (
          <TableRow key={unit.id}>
            <TableCell>{unit.product.name}</TableCell>
            <TableCell>{unit.orderItem.order.code}</TableCell>
            <TableCell>{unit.status}</TableCell>
            <TableCell className="text-right tabular-nums">{currency(unit.acquisitionCost.toNumber())}</TableCell>
            <TableCell>{formatDate(unit.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
