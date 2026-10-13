"use client";

import Link from "next/link";

import { PlatformDataTable, type PlatformTableColumn, type PlatformTableManualPagination } from "@/components/data-table/platform-data-table";
import { currency } from "@/lib/money/format";
import { formatDate } from "@/server/shared/format";

type OrderRow = { id: string; code: string; status: string; orderDate: Date; supplier: string; total: number };

const statusOptions = [
  { value: "ORDER_PLACED", label: "Pedido realizado" },
  { value: "IN_TRANSIT", label: "En camino" },
  { value: "RECEIVED", label: "Recibido" },
];

const columns: PlatformTableColumn<OrderRow>[] = [
  { id: "code", header: "Código", value: (order) => order.code, sortable: true, filter: "text", cell: (order) => <Link href={`/pedidos/${order.id}`} className="font-medium text-primary hover:underline">{order.code}</Link> },
  { id: "supplier", header: "Proveedor", value: (order) => order.supplier, sortable: true, filter: "text", cell: (order) => order.supplier },
  { id: "status", header: "Estado", value: (order) => order.status, sortable: true, filter: "enum", options: statusOptions, cell: (order) => order.status },
  { id: "orderDate", header: "Fecha", value: (order) => order.orderDate, sortable: true, filter: "date", cell: (order) => formatDate(order.orderDate) },
  { id: "total", header: "Total", value: (order) => order.total, sortable: true, filter: "number", align: "right", cell: (order) => currency(order.total) },
];

export function OrdersTable({ orders, pagination }: { orders: OrderRow[]; pagination: PlatformTableManualPagination }) {
  return <PlatformDataTable data={orders} columns={columns} rowKey={(order) => order.id} entity={{ singular: "pedido", plural: "pedidos" }} searchPlaceholder="Buscar por código o proveedor" searchText={(order) => `${order.code} ${order.supplier}`} initialSort={{ id: "orderDate", dir: "desc" }} minWidth="860px" emptyLabel="No se encontraron pedidos." manualPagination={pagination} />;
}
