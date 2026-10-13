import { requirePermission } from "@/lib/auth/guards";
import { CustomersTable } from "@/components/catalogs/customers-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerList } from "@/server/catalogs/queries";
import { parseListParams } from "@/server/shared/pagination";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("sales.manage");
  const params = parseListParams(await searchParams);
  const customers = await getCustomerList(params);

  return (
    <>
      <PageHeader title="Clientes" description="Clientes requeridos para registrar cualquier venta." />
      <Card>
        <CardHeader><CardTitle>Clientes</CardTitle><CardDescription>Filtra y navega clientes por nombre.</CardDescription></CardHeader>
        <CardContent>
          <CustomersTable customers={customers.rows} pagination={{ page: customers.page, pageSize: customers.pageSize, totalRows: customers.total, basePath: "/clientes", q: params.q }} />
        </CardContent>
      </Card>
    </>
  );
}
