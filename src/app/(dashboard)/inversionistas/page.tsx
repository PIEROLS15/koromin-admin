import { requirePermission } from "@/lib/auth/guards";
import { InvestorsTable } from "@/components/finance/investors-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvestorRows } from "@/server/finance/queries";

export default async function InvestorsPage() {
  await requirePermission("finance.view");
  const investors = await getInvestorRows();

  return (
    <>
      <PageHeader title="Inversionistas" description="Vista financiera de usuarios con aportes; no es un CRUD independiente." />
      <Card>
        <CardHeader><CardTitle>Usuarios inversionistas</CardTitle><CardDescription>Aparecen automáticamente cuando tienen aportes registrados.</CardDescription></CardHeader>
        <CardContent><InvestorsTable investors={investors} /></CardContent>
      </Card>
    </>
  );
}
