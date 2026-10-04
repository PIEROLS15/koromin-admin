import { requirePermission } from "@/lib/auth/guards";
import { PaginationControls } from "@/components/data-table/pagination";
import { TableSearchForm } from "@/components/data-table/search-form";
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
          <TableSearchForm q={params.q} placeholder="Buscar cliente" />
          <CustomersTable customers={customers.rows} />
          <PaginationControls result={customers} basePath="/clientes" q={params.q} />
        </CardContent>
      </Card>
    </>
  );
}
