import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency } from "@/lib/money/format";
import { formatDate } from "@/server/shared/format";

export function ExpensesTable({ expenses }: { expenses: Array<{ id: string; date: Date; type: string; description: string; amount: { toNumber: () => number }; order: { code: string } | null; sale: { code: string } | null }> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead>Relacionado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>{formatDate(expense.date)}</TableCell>
            <TableCell>{expense.type}</TableCell>
            <TableCell>{expense.description}</TableCell>
            <TableCell className="text-right tabular-nums">{currency(expense.amount.toNumber())}</TableCell>
            <TableCell>{expense.order?.code ?? expense.sale?.code ?? "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
