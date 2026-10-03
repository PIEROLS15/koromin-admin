import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency } from "@/lib/money/format";

export function InvestorsTable({ investors }: { investors: Array<{ userId: string; name: string; total: number; count: number }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead className="text-right">Total invertido</TableHead>
          <TableHead className="text-right">Aportes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {investors.map((investor) => (
          <TableRow key={investor.userId}>
            <TableCell>{investor.name}</TableCell>
            <TableCell className="text-right tabular-nums">{currency(investor.total)}</TableCell>
            <TableCell className="text-right tabular-nums">{investor.count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
