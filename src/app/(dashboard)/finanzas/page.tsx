import { requirePermission } from "@/lib/auth/guards";
import { FinanceBreakdown } from "@/components/finance/finance-breakdown";
import { FinanceFilters } from "@/components/finance/finance-filters";
import { PageHeader } from "@/components/layout/page-header";
import { getFinanceOptions, getFinanceSummary } from "@/server/finance/summary";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value ? value : null;
}

export default async function FinancePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requirePermission("finance.view");
  const params = await searchParams;

  const filters = {
    from: first(params.from),
    to: first(params.to),
    franchiseId: first(params.franchise),
    productTypeId: first(params.type),
    orderId: first(params.order),
    investorId: first(params.investor),
  };

  const [options, summary] = await Promise.all([getFinanceOptions(), getFinanceSummary(filters)]);

  return (
    <>
      <PageHeader title="Finanzas" description="Inversión, ingresos y rentabilidad del negocio." />
      <FinanceFilters options={options} />
      <FinanceBreakdown summary={summary} />
    </>
  );
}
