"use client";

import { PlatformDataTable, type PlatformTableColumn, type PlatformTableManualPagination } from "@/components/data-table/platform-data-table";

type SupplierRow = { id: string; name: string; contact: string | null; website: string | null; ordersCount: number };

const columns: PlatformTableColumn<SupplierRow>[] = [
  { id: "name", header: "Nombre", value: (supplier) => supplier.name, sortable: true, filter: "text", className: "font-medium", cell: (supplier) => supplier.name },
  { id: "contact", header: "Contacto", value: (supplier) => supplier.contact, sortable: true, filter: "text", cell: (supplier) => supplier.contact ?? "-" },
  { id: "website", header: "Página", value: (supplier) => supplier.website, sortable: true, filter: "text", cell: (supplier) => supplier.website ?? "-" },
  { id: "ordersCount", header: "Pedidos", value: (supplier) => supplier.ordersCount, sortable: true, filter: "number", align: "right", cell: (supplier) => supplier.ordersCount },
];

export function SuppliersTable({ suppliers, pagination }: { suppliers: SupplierRow[]; pagination: PlatformTableManualPagination }) {
  return <PlatformDataTable data={suppliers} columns={columns} rowKey={(supplier) => supplier.id} entity={{ singular: "proveedor", plural: "proveedores" }} searchPlaceholder="Buscar proveedor" searchText={(supplier) => `${supplier.name} ${supplier.contact ?? ""} ${supplier.website ?? ""}`} initialSort={{ id: "name", dir: "asc" }} minWidth="820px" emptyLabel="No se encontraron proveedores." manualPagination={pagination} />;
}
