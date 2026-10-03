import { requirePermission } from "@/lib/auth/guards";
import { ExpensesTable } from "@/components/finance/expenses-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpenseList } from "@/server/finance/queries";

export default async function FinancePage() {
  await requirePermission("finance.view");
  const expenses = await getExpenseList();

  return (
    <>
      <PageHeader title="Finanzas" description="Gastos, inversión, recuperación de capital y ganancia." />
      <Card>
        <CardHeader><CardTitle>Gastos registrados</CardTitle><CardDescription>Mostrando hasta 100 movimientos.</CardDescription></CardHeader>
        <CardContent><ExpensesTable expenses={expenses} /></CardContent>
      </Card>
    </>
  );
}
