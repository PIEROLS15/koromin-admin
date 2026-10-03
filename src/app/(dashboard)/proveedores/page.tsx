import { requirePermission } from "@/lib/auth/guards";
import { SuppliersTable } from "@/components/catalogs/suppliers-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupplierList } from "@/server/catalogs/queries";

export default async function SuppliersPage() {
  await requirePermission("orders.manage");
  const suppliers = await getSupplierList();

  return (
    <>
      <PageHeader title="Proveedores" description="Proveedores asociados a pedidos de compra." />
      <Card>
        <CardHeader><CardTitle>Proveedores</CardTitle><CardDescription>Mostrando hasta 100 proveedores.</CardDescription></CardHeader>
        <CardContent><SuppliersTable suppliers={suppliers} /></CardContent>
      </Card>
    </>
  );
}
