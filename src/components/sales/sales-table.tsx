import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency } from "@/lib/money/format";
import { getSaleTotal } from "@/server/sales/queries";
import { formatDate } from "@/server/shared/format";

export function SalesTable({ sales }: { sales: Array<Parameters<typeof getSaleTotal>[0] & { id: string; code: string; saleDate: Date; customer: { name: string } }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell className="font-medium">{sale.code}</TableCell>
            <TableCell>{sale.customer.name}</TableCell>
            <TableCell>{formatDate(sale.saleDate)}</TableCell>
            <TableCell className="text-right tabular-nums">{currency(getSaleTotal(sale))}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
