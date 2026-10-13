"use client";

import { PlatformDataTable, type PlatformTableColumn, type PlatformTableManualPagination } from "@/components/data-table/platform-data-table";
import { currency } from "@/lib/money/format";
import { formatDate } from "@/server/shared/format";

type SaleRow = { id: string; code: string; saleDate: Date; customer: string; total: number };

const columns: PlatformTableColumn<SaleRow>[] = [
  { id: "code", header: "Código", value: (sale) => sale.code, sortable: true, filter: "text", className: "font-medium", cell: (sale) => sale.code },
  { id: "customer", header: "Cliente", value: (sale) => sale.customer, sortable: true, filter: "text", cell: (sale) => sale.customer },
  { id: "saleDate", header: "Fecha", value: (sale) => sale.saleDate, sortable: true, filter: "date", cell: (sale) => formatDate(sale.saleDate) },
  { id: "total", header: "Total", value: (sale) => sale.total, sortable: true, filter: "number", align: "right", cell: (sale) => currency(sale.total) },
];

export function SalesTable({ sales, pagination }: { sales: SaleRow[]; pagination: PlatformTableManualPagination }) {
  return <PlatformDataTable data={sales} columns={columns} rowKey={(sale) => sale.id} entity={{ singular: "venta", plural: "ventas" }} searchPlaceholder="Buscar por código o cliente" searchText={(sale) => `${sale.code} ${sale.customer}`} initialSort={{ id: "saleDate", dir: "desc" }} minWidth="760px" emptyLabel="No se encontraron ventas." manualPagination={pagination} />;
}
