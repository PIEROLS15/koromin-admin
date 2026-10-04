import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency } from "@/lib/money/format";

export function ProductsTable({ products }: { products: Array<{ id: string; name: string; salePrice: { toNumber: () => number }; productType: { name: string }; franchise: { name: string }; category: { name: string } | null }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Franquicia</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead className="text-right">Precio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.productType.name}</TableCell>
            <TableCell>{product.franchise.name}</TableCell>
            <TableCell>{product.category?.name ?? "-"}</TableCell>
            <TableCell className="text-right tabular-nums">{currency(product.salePrice.toNumber())}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
