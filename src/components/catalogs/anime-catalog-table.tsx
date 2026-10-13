"use client";

import { PlatformDataTable, type PlatformTableColumn } from "@/components/data-table/platform-data-table";
import { Badge } from "@/components/ui/badge";

type AnimeCatalogRow = { id: string; name: string; type: string; active: boolean; products: number };

const columns: PlatformTableColumn<AnimeCatalogRow>[] = [
  { id: "name", header: "Nombre", value: (row) => row.name, sortable: true, filter: "text", className: "font-medium", cell: (row) => row.name },
  { id: "type", header: "Tipo", value: (row) => row.type, sortable: true, filter: "enum", options: [{ value: "Franquicia", label: "Franquicia" }, { value: "Categoría", label: "Categoría" }, { value: "Tipo", label: "Tipo" }], cell: (row) => row.type },
  { id: "active", header: "Activo", value: (row) => (row.active ? "Sí" : "No"), sortable: true, filter: "enum", options: [{ value: "Sí", label: "Sí" }, { value: "No", label: "No" }], cell: (row) => <Badge className="border-transparent bg-primary-softer text-primary">{row.active ? "Sí" : "No"}</Badge> },
  { id: "products", header: "Productos", value: (row) => row.products, sortable: true, filter: "number", align: "right", cell: (row) => row.products },
];

export function AnimeCatalogTable({ rows }: { rows: AnimeCatalogRow[] }) {
  return <PlatformDataTable data={rows} columns={columns} rowKey={(row) => row.id} entity={{ singular: "catálogo", plural: "catálogos" }} searchPlaceholder="Buscar catálogo" searchText={(row) => `${row.name} ${row.type}`} initialSort={{ id: "name", dir: "asc" }} minWidth="760px" emptyLabel="No se encontraron catálogos." />;
}
