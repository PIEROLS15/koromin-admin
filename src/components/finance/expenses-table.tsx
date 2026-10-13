"use client";

import { PlatformDataTable, type PlatformTableColumn } from "@/components/data-table/platform-data-table";
import { currency } from "@/lib/money/format";
import { formatDate } from "@/server/shared/format";

type ExpenseRow = { id: string; date: Date; type: string; description: string; amount: number; relatedCode: string | null };

const columns: PlatformTableColumn<ExpenseRow>[] = [
  { id: "date", header: "Fecha", value: (expense) => expense.date, sortable: true, filter: "date", cell: (expense) => formatDate(expense.date) },
  { id: "type", header: "Tipo", value: (expense) => expense.type, sortable: true, filter: "text", cell: (expense) => expense.type },
  { id: "description", header: "Descripción", value: (expense) => expense.description, sortable: true, filter: "text", className: "font-medium", cell: (expense) => expense.description },
  { id: "amount", header: "Monto", value: (expense) => expense.amount, sortable: true, filter: "number", align: "right", cell: (expense) => currency(expense.amount) },
  { id: "relatedCode", header: "Relacionado", value: (expense) => expense.relatedCode, sortable: true, filter: "text", cell: (expense) => expense.relatedCode ?? "-" },
];

export function ExpensesTable({ expenses }: { expenses: ExpenseRow[] }) {
  return <PlatformDataTable data={expenses} columns={columns} rowKey={(expense) => expense.id} entity={{ singular: "movimiento", plural: "movimientos" }} searchPlaceholder="Buscar gasto" searchText={(expense) => `${expense.type} ${expense.description} ${expense.relatedCode ?? ""}`} initialSort={{ id: "date", dir: "desc" }} minWidth="900px" emptyLabel="No se encontraron movimientos." />;
}
