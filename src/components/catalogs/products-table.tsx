"use client";

import { PlatformDataTable, type PlatformTableColumn, type PlatformTableManualPagination } from "@/components/data-table/platform-data-table";
import { currency } from "@/lib/money/format";

type ProductRow = { id: string; name: string; salePrice: number; productType: string; franchise: string; category: string | null };

const columns: PlatformTableColumn<ProductRow>[] = [
  { id: "name", header: "Producto", value: (product) => product.name, sortable: true, filter: "text", className: "font-medium", cell: (product) => product.name },
  { id: "productType", header: "Tipo", value: (product) => product.productType, sortable: true, filter: "text", cell: (product) => product.productType },
  { id: "franchise", header: "Franquicia", value: (product) => product.franchise, sortable: true, filter: "text", cell: (product) => product.franchise },
  { id: "category", header: "Categoría", value: (product) => product.category, sortable: true, filter: "text", cell: (product) => product.category ?? "-" },
  { id: "salePrice", header: "Precio", value: (product) => product.salePrice, sortable: true, filter: "number", align: "right", cell: (product) => currency(product.salePrice) },
];

export function ProductsTable({ products, pagination }: { products: ProductRow[]; pagination: PlatformTableManualPagination }) {
  return <PlatformDataTable data={products} columns={columns} rowKey={(product) => product.id} entity={{ singular: "producto", plural: "productos" }} searchPlaceholder="Buscar producto" searchText={(product) => `${product.name} ${product.productType} ${product.franchise} ${product.category ?? ""}`} initialSort={{ id: "name", dir: "asc" }} minWidth="920px" emptyLabel="No se encontraron productos." manualPagination={pagination} />;
}
