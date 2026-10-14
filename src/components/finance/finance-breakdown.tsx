import { Coins, Percent, Receipt, TrendingUp } from "lucide-react";

import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { currency, percent } from "@/lib/money/format";
import type { FinanceSummary } from "@/server/finance/summary";

function MoneyRow({
  label,
  value,
  strong,
  destructive,
}: {
  label: string;
  value: string;
  strong?: boolean;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</span>
      <span className={cn("tabular-nums", strong && "font-semibold", destructive && "text-destructive")}>
        {value}
      </span>
    </div>
  );
}

function Separator() {
  return <div className="my-2 border-t" />;
}

export function FinanceBreakdown({ summary }: { summary: FinanceSummary }) {
  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Inversión total" value={currency(summary.totalInvestment)} icon={Coins} tone="primary" />
        <StatCard title="Ingresos" value={currency(summary.revenue)} icon={Receipt} tone="info" />
        <StatCard
          title="Ganancia neta"
          value={currency(summary.netProfit)}
          icon={TrendingUp}
          tone={summary.netProfit >= 0 ? "success" : "primary"}
        />
        <StatCard title="Margen" value={percent(summary.margin)} icon={Percent} tone="gold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inversión</CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyRow label="Costo de productos" value={currency(summary.productsCost)} />
            <MoneyRow label="Delivery de compras" value={currency(summary.delivery)} />
            <MoneyRow label="Otros gastos" value={currency(summary.other)} />
            <Separator />
            <MoneyRow label="Inversión total" value={currency(summary.totalInvestment)} strong />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyRow label="Ingresos por productos" value={currency(summary.income)} />
            <MoneyRow label="Descuentos" value={`- ${currency(summary.discounts)}`} destructive />
            <MoneyRow label="Delivery cobrado" value={currency(summary.deliveryCharged)} />
            <MoneyRow label="Otros ingresos" value={currency(summary.otherCharges)} />
            <MoneyRow label="Gastos de ventas" value={`- ${currency(summary.saleExpenses)}`} destructive />
            <Separator />
            <MoneyRow label="Total cobrado" value={currency(summary.revenue)} strong />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rentabilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <MoneyRow label="Unidades vendidas" value={String(summary.unitsSold)} />
            <MoneyRow label="Costo de mercadería vendida" value={currency(summary.cogs)} />
            <MoneyRow label="Ganancia bruta" value={currency(summary.grossProfit)} />
            <MoneyRow label="Gastos" value={currency(summary.saleExpenses)} />
            <Separator />
            <MoneyRow
              label="Ganancia neta"
              value={currency(summary.netProfit)}
              strong
              destructive={summary.netProfit < 0}
            />
            <MoneyRow label="Margen de ganancia" value={percent(summary.margin)} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
