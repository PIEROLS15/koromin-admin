"use client";

import { PlatformDataTable, type PlatformTableColumn } from "@/components/data-table/platform-data-table";
import { currency } from "@/lib/money/format";
import { formatDate } from "@/server/shared/format";

type InventoryRow = { id: string; status: string; createdAt: Date; acquisitionCost: number; product: string; orderCode: string };

const columns: PlatformTableColumn<InventoryRow>[] = [
  { id: "product", header: "Producto", value: (unit) => unit.product, sortable: true, filter: "text", className: "font-medium", cell: (unit) => unit.product },
  { id: "orderCode", header: "Pedido", value: (unit) => unit.orderCode, sortable: true, filter: "text", cell: (unit) => unit.orderCode },
  { id: "status", header: "Estado", value: (unit) => unit.status, sortable: true, filter: "text", cell: (unit) => unit.status },
  { id: "acquisitionCost", header: "Costo", value: (unit) => unit.acquisitionCost, sortable: true, filter: "number", align: "right", cell: (unit) => currency(unit.acquisitionCost) },
  { id: "createdAt", header: "Creado", value: (unit) => unit.createdAt, sortable: true, filter: "date", cell: (unit) => formatDate(unit.createdAt) },
];

export function InventoryTable({ units }: { units: InventoryRow[] }) {
  return <PlatformDataTable data={units} columns={columns} rowKey={(unit) => unit.id} entity={{ singular: "unidad", plural: "unidades" }} searchPlaceholder="Buscar por producto o pedido" searchText={(unit) => `${unit.product} ${unit.orderCode} ${unit.status}`} initialSort={{ id: "createdAt", dir: "desc" }} minWidth="860px" emptyLabel="No se encontraron unidades." />;
}
