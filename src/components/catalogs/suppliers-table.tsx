import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SuppliersTable({ suppliers }: { suppliers: Array<{ id: string; name: string; contact: string | null; website: string | null; _count: { orders: number } }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>Página</TableHead>
          <TableHead className="text-right">Pedidos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <TableRow key={supplier.id}>
            <TableCell className="font-medium">{supplier.name}</TableCell>
            <TableCell>{supplier.contact ?? "-"}</TableCell>
            <TableCell>{supplier.website ?? "-"}</TableCell>
            <TableCell className="text-right tabular-nums">{supplier._count.orders}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
