import { requirePermission } from "@/lib/auth/guards";
import { SuppliersTable } from "@/components/catalogs/suppliers-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupplierList } from "@/server/catalogs/queries";
import { parseListParams } from "@/server/shared/pagination";

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("orders.manage");
  const params = parseListParams(await searchParams);
  const suppliers = await getSupplierList(params);

  return (
    <>
      <PageHeader title="Proveedores" description="Proveedores asociados a pedidos de compra." />
      <Card>
        <CardHeader><CardTitle>Proveedores</CardTitle><CardDescription>Filtra y navega proveedores por nombre.</CardDescription></CardHeader>
        <CardContent>
          <SuppliersTable suppliers={suppliers.rows} pagination={{ page: suppliers.page, pageSize: suppliers.pageSize, totalRows: suppliers.total, basePath: "/proveedores", q: params.q }} />
        </CardContent>
      </Card>
    </>
  );
}
