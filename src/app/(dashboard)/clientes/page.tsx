import { requirePermission } from "@/lib/auth/guards";
import { CustomersTable } from "@/components/catalogs/customers-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerList } from "@/server/catalogs/queries";

export default async function CustomersPage() {
  await requirePermission("sales.manage");
  const customers = await getCustomerList();

  return (
    <>
      <PageHeader title="Clientes" description="Clientes requeridos para registrar cualquier venta." />
      <Card>
        <CardHeader><CardTitle>Clientes</CardTitle><CardDescription>Mostrando hasta 100 clientes.</CardDescription></CardHeader>
        <CardContent><CustomersTable customers={customers} /></CardContent>
      </Card>
    </>
  );
}
