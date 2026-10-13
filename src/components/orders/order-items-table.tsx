"use client";

import { PlatformDataTable, type PlatformTableColumn } from "@/components/data-table/platform-data-table";
import { currency } from "@/lib/money/format";

export type OrderItemRow = {
  id: string;
  product: string;
  quantity: number;
  unitPurchaseCost: number;
  inventoryUnits: number;
};

const columns: PlatformTableColumn<OrderItemRow>[] = [
  { id: "product", header: "Producto", value: (item) => item.product, sortable: true, filter: "text", className: "font-medium", cell: (item) => item.product },
  { id: "quantity", header: "Cantidad", value: (item) => item.quantity, sortable: true, align: "right", cell: (item) => item.quantity },
  { id: "unitPurchaseCost", header: "Costo unitario", value: (item) => item.unitPurchaseCost, sortable: true, align: "right", cell: (item) => currency(item.unitPurchaseCost) },
  { id: "inventoryUnits", header: "Unidades creadas", value: (item) => item.inventoryUnits, sortable: true, align: "right", cell: (item) => item.inventoryUnits },
];

export function OrderItemsTable({ items }: { items: OrderItemRow[] }) {
  return <PlatformDataTable data={items} columns={columns} rowKey={(item) => item.id} entity={{ singular: "producto", plural: "productos" }} searchPlaceholder="Buscar producto" searchText={(item) => item.product} initialSort={{ id: "product", dir: "asc" }} minWidth="760px" emptyLabel="Sin productos registrados." showFooter={false} />;
}
