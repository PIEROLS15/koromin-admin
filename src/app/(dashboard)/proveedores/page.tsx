import { requirePermission } from "@/lib/auth/guards";
import { SuppliersManager } from "@/components/catalogs/suppliers-table";
import { getSupplierList } from "@/server/catalogs/queries";
import { parseListParams } from "@/server/shared/pagination";

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("orders.manage");
  const params = parseListParams(await searchParams);
  const suppliers = await getSupplierList(params);

  return (
    <SuppliersManager
      suppliers={suppliers.rows}
      pagination={{
        page: suppliers.page,
        pageSize: suppliers.pageSize,
        totalRows: suppliers.total,
        basePath: "/proveedores",
        q: params.q,
      }}
    />
  );
}
