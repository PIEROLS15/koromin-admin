import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/server/shared/format";

export function CustomersTable({ customers }: { customers: Array<{ id: string; name: string; contact: string | null; createdAt: Date; _count: { sales: number } }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead className="text-right">Ventas</TableHead>
          <TableHead>Creado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>{customer.contact ?? "-"}</TableCell>
            <TableCell className="text-right tabular-nums">{customer._count.sales}</TableCell>
            <TableCell>{formatDate(customer.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
