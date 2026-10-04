import Link from "next/link";

import { PaginationControls } from "@/components/data-table/pagination";
import { TableSearchForm } from "@/components/data-table/search-form";
import { PageHeader } from "@/components/layout/page-header";
import { SalesTable } from "@/components/sales/sales-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { getSaleList } from "@/server/sales/queries";
import { parseListParams } from "@/server/shared/pagination";

export default async function SalesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("sales.manage");
  const params = parseListParams(await searchParams);
  const sales = await getSaleList(params);

  return (
    <>
      <PageHeader title="Ventas" description="Ventas con cliente obligatorio, unidades FIFO y ganancia por costo real." actions={<Button asChild><Link href="/ventas/nueva">Nueva venta</Link></Button>} />
      <Card>
        <CardHeader>
          <CardTitle>Últimas ventas</CardTitle>
          <CardDescription>Filtra y navega ventas por código o cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          <TableSearchForm q={params.q} placeholder="Buscar por código o cliente" />
          <SalesTable sales={sales.rows} />
          <PaginationControls result={sales} basePath="/ventas" q={params.q} />
        </CardContent>
      </Card>
    </>
  );
}
