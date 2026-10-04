import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AnimeCatalogTable({ rows }: { rows: Array<{ id: string; name: string; type: string; active: boolean; products: number }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Activo</TableHead>
          <TableHead className="text-right">Productos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>{row.type}</TableCell>
            <TableCell>{row.active ? "Sí" : "No"}</TableCell>
            <TableCell className="text-right tabular-nums">{row.products}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
