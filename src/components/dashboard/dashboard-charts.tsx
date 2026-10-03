"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard, MoneyTooltip, NumberTooltip, PeriodFilter, PieLegend, axis, chartColors } from "@/components/dashboard/dashboard-widgets";
import { compactCurrency, inventorySplit as getInventorySplit, monthlyPresets, monthlySeries, periodPresets, profitabilityByType, salesByFranchise, topPresets, topProducts as getTopProducts, type PeriodState } from "@/lib/dashboard/metrics";
import type { DashboardInventory, DashboardOrder, DashboardSale } from "@/lib/dashboard/types";

export function DashboardCharts({ sales, orders, inventory }: { sales: DashboardSale[]; orders: DashboardOrder[]; inventory: DashboardInventory }) {
  const [salesPeriod, setSalesPeriod] = useState<PeriodState>({ preset: "12m" });
  const [profitPeriod, setProfitPeriod] = useState<PeriodState>({ preset: "12m" });
  const [investmentPeriod, setInvestmentPeriod] = useState<PeriodState>({ preset: "12m" });
  const [topPeriod, setTopPeriod] = useState<PeriodState>({ preset: "3m" });
  const [franchisePeriod, setFranchisePeriod] = useState<PeriodState>({ preset: "all" });
  const [typePeriod, setTypePeriod] = useState<PeriodState>({ preset: "all" });

  const salesMonthly = useMemo(() => monthlySeries(sales, [], salesPeriod), [sales, salesPeriod]);
  const profitMonthly = useMemo(() => monthlySeries(sales, [], profitPeriod), [sales, profitPeriod]);
  const investmentMonthly = useMemo(() => monthlySeries(sales, orders, investmentPeriod), [sales, orders, investmentPeriod]);
  const topProducts = useMemo(() => getTopProducts(sales, topPeriod), [sales, topPeriod]);
  const byFranchise = useMemo(() => salesByFranchise(sales, franchisePeriod), [sales, franchisePeriod]);
  const inventorySplit = getInventorySplit(inventory);
  const byType = useMemo(() => profitabilityByType(sales, typePeriod), [sales, typePeriod]);

  return (
    <>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Ventas por mes" description="Ingresos cobrados por mes" empty={salesMonthly.length === 0} filter={<PeriodFilter value={salesPeriod} onChange={setSalesPeriod} presets={monthlyPresets} />}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={salesMonthly}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /><XAxis dataKey="mes" {...axis} /><YAxis {...axis} /><Tooltip content={<MoneyTooltip />} /><Line type="monotone" dataKey="ventas" name="Ventas" stroke="var(--color-chart-1)" strokeWidth={2.5} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Ganancias por mes" description="Utilidad neta mensual" empty={profitMonthly.length === 0} filter={<PeriodFilter value={profitPeriod} onChange={setProfitPeriod} presets={monthlyPresets} />}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={profitMonthly}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /><XAxis dataKey="mes" {...axis} /><YAxis {...axis} /><Tooltip content={<MoneyTooltip />} /><Line type="monotone" dataKey="ganancia" name="Ganancia" stroke="var(--color-chart-4)" strokeWidth={2.5} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Inversión vs ingresos" description="Comparativa mensual de capital y retorno" empty={investmentMonthly.length === 0} filter={<PeriodFilter value={investmentPeriod} onChange={setInvestmentPeriod} presets={periodPresets} />}>
          <ResponsiveContainer width="100%" height="100%"><BarChart data={investmentMonthly}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /><XAxis dataKey="mes" {...axis} /><YAxis {...axis} /><Tooltip content={<MoneyTooltip />} /><Bar dataKey="inversion" name="Inversión" fill="var(--color-chart-2)" radius={6} /><Bar dataKey="ventas" name="Ingresos" fill="var(--color-chart-3)" radius={6} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Productos más vendidos" description="Unidades vendidas por producto" empty={topProducts.length === 0} filter={<PeriodFilter value={topPeriod} onChange={setTopPeriod} presets={topPresets} />}>
          <ResponsiveContainer width="100%" height="100%"><BarChart data={topProducts} layout="vertical" margin={{ left: 24 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /><XAxis type="number" allowDecimals={false} {...axis} /><YAxis type="category" dataKey="name" width={140} fontSize={11} stroke="var(--color-muted-foreground)" /><Tooltip content={<NumberTooltip />} /><Bar dataKey="qty" name="Unidades" fill="var(--color-chart-1)" radius={6} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Ventas por anime / franquicia" description="Monto vendido por franquicia" height="h-56" empty={byFranchise.length === 0} filter={<PeriodFilter value={franchisePeriod} onChange={setFranchisePeriod} presets={periodPresets} />} footer={<PieLegend rows={byFranchise} format={compactCurrency} />}>
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={byFranchise} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85}>{byFranchise.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip content={<MoneyTooltip />} /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Distribución actual del inventario" description="Unidades según su estado actual" height="h-56" empty={inventorySplit.length === 0} footer={<PieLegend rows={inventorySplit} format={(value) => `${value} u.`} />}>
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={inventorySplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85}>{inventorySplit.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip content={<NumberTooltip />} /></PieChart></ResponsiveContainer>
        </ChartCard>
      </section>
      <section className="mt-6">
        <ChartCard title="Rentabilidad por tipo de producto" description="Ventas y ganancia bruta según el costo real de cada unidad" empty={byType.length === 0} filter={<PeriodFilter value={typePeriod} onChange={setTypePeriod} presets={periodPresets} />}>
          <ResponsiveContainer width="100%" height="100%"><BarChart data={byType}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" /><XAxis dataKey="tipo" {...axis} /><YAxis {...axis} /><Tooltip content={<MoneyTooltip />} /><Bar dataKey="ventas" name="Ventas" fill="var(--color-chart-1)" radius={6} /><Bar dataKey="ganancia" name="Ganancia" fill="var(--color-chart-4)" radius={6} /></BarChart></ResponsiveContainer>
        </ChartCard>
      </section>
    </>
  );
}
