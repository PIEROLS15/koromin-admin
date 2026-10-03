import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { SalesTable } from "@/components/sales/sales-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { getSaleList } from "@/server/sales/queries";

export default async function SalesPage() {
  await requirePermission("sales.manage");
  const sales = await getSaleList();

  return (
    <>
      <PageHeader title="Ventas" description="Ventas con cliente obligatorio, unidades FIFO y ganancia por costo real." actions={<Button asChild><Link href="/ventas/nueva">Nueva venta</Link></Button>} />
      <Card>
        <CardHeader>
          <CardTitle>Últimas ventas</CardTitle>
          <CardDescription>Mostrando hasta 50 registros.</CardDescription>
        </CardHeader>
        <CardContent><SalesTable sales={sales} /></CardContent>
      </Card>
    </>
  );
}
