"use client";

import { PlatformDataTable, type PlatformTableColumn } from "@/components/data-table/platform-data-table";
import { currency } from "@/lib/money/format";

type InvestorRow = { userId: string; name: string; total: number; count: number };

const columns: PlatformTableColumn<InvestorRow>[] = [
  { id: "name", header: "Usuario", value: (investor) => investor.name, sortable: true, filter: "text", className: "font-medium", cell: (investor) => investor.name },
  { id: "total", header: "Total invertido", value: (investor) => investor.total, sortable: true, align: "right", cell: (investor) => currency(investor.total) },
  { id: "count", header: "Aportes", value: (investor) => investor.count, sortable: true, align: "right", cell: (investor) => investor.count },
];

export function InvestorsTable({ investors }: { investors: InvestorRow[] }) {
  return <PlatformDataTable data={investors} columns={columns} rowKey={(investor) => investor.userId} entity={{ singular: "inversionista", plural: "inversionistas" }} searchPlaceholder="Buscar inversionista" searchText={(investor) => investor.name} initialSort={{ id: "total", dir: "desc" }} minWidth="680px" emptyLabel="No se encontraron inversionistas." />;
}
