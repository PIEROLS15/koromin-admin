"use client";

import { PlatformDataTable, type PlatformTableColumn, type PlatformTableManualPagination } from "@/components/data-table/platform-data-table";
import { formatDate } from "@/server/shared/format";

type CustomerRow = { id: string; name: string; contact: string | null; createdAt: Date; salesCount: number };

const columns: PlatformTableColumn<CustomerRow>[] = [
  { id: "name", header: "Nombre", value: (customer) => customer.name, sortable: true, filter: "text", className: "font-medium", cell: (customer) => customer.name },
  { id: "contact", header: "Contacto", value: (customer) => customer.contact, sortable: true, filter: "text", cell: (customer) => customer.contact ?? "-" },
  { id: "salesCount", header: "Ventas", value: (customer) => customer.salesCount, sortable: true, filter: "number", align: "right", cell: (customer) => customer.salesCount },
  { id: "createdAt", header: "Creado", value: (customer) => customer.createdAt, sortable: true, filter: "date", cell: (customer) => formatDate(customer.createdAt) },
];

export function CustomersTable({ customers, pagination }: { customers: CustomerRow[]; pagination: PlatformTableManualPagination }) {
  return <PlatformDataTable data={customers} columns={columns} rowKey={(customer) => customer.id} entity={{ singular: "cliente", plural: "clientes" }} searchPlaceholder="Buscar cliente" searchText={(customer) => `${customer.name} ${customer.contact ?? ""}`} initialSort={{ id: "name", dir: "asc" }} minWidth="760px" emptyLabel="No se encontraron clientes." manualPagination={pagination} />;
}
