"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currency } from "@/lib/money/format";

const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

type Preset = "30d" | "3m" | "6m" | "12m" | "year" | "all";

const presetLabels: Record<Preset, string> = {
  "30d": "Últimos 30 días",
  "3m": "Últimos 3 meses",
  "6m": "Últimos 6 meses",
  "12m": "Últimos 12 meses",
  year: "Año actual",
  all: "Todo el historial",
};

const monthlyPresets: Preset[] = ["3m", "6m", "12m", "year", "all"];
const periodPresets: Preset[] = ["3m", "6m", "12m", "year", "all"];
const topPresets: Preset[] = ["30d", "3m", "6m", "year", "all"];

export interface DashboardSale {
  id: string;
  code: string;
  date: string;
  customer: string;
  total: number;
  profit: number;
  items: {
    productId: string;
    productName: string;
    franchiseName: string;
    typeName: string;
    quantity: number;
    revenue: number;
    profit: number;
  }[];
}

export interface DashboardOrder {
  id: string;
  code: string;
  date: string;
  supplier: string;
  status: string;
  total: number;
  units: number;
  deliveryCost: number;
  estimatedArrivalDate: string | null;
  receivedAt: string | null;
}

export interface DashboardInventory {
  ordered: number;
  inStock: number;
  sold: number;
}

export interface DashboardClientProps {
  sales: DashboardSale[];
  orders: DashboardOrder[];
  inventory: DashboardInventory;
}

interface PeriodState {
  preset: Preset;
}

function inPeriod(date: string, period: PeriodState) {
  if (period.preset === "all") return true;
  const value = new Date(`${date}T00:00:00`);
  const now = new Date();
  const from = new Date(now);

  if (period.preset === "30d") from.setDate(now.getDate() - 30);
  if (period.preset === "3m") from.setMonth(now.getMonth() - 3);
  if (period.preset === "6m") from.setMonth(now.getMonth() - 6);
  if (period.preset === "12m") from.setMonth(now.getMonth() - 12);
  if (period.preset === "year") {
    from.setMonth(0);
    from.setDate(1);
  }

  from.setHours(0, 0, 0, 0);
  return value >= from;
}

function monthKey(date: string) {
  return date.slice(0, 7);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", { month: "short", year: "2-digit" }).format(
    new Date(year, month - 1, 1),
  );
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

function PeriodFilter({
  value,
  onChange,
  presets,
}: {
  value: PeriodState;
  onChange: (value: PeriodState) => void;
  presets: Preset[];
}) {
  return (
    <Select
      value={value.preset}
      onValueChange={(preset) => onChange({ preset: preset as Preset })}
    >
      <SelectTrigger className="h-8 min-w-40 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {presets.map((preset) => (
          <SelectItem key={preset} value={preset} className="text-xs">
            {presetLabels[preset]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ChartCard({
  title,
  description,
  filter,
  empty,
  height = "h-72",
  children,
  footer,
}: {
  title: string;
  description?: string;
  filter?: ReactNode;
  empty: boolean;
  height?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {filter}
      </CardHeader>
      <CardContent className="flex-1">
        {empty ? (
          <div className={`${height} grid place-items-center rounded-lg border border-dashed text-center text-sm text-muted-foreground`}>
            No hay información disponible para el periodo seleccionado.
          </div>
        ) : (
          <>
            <div className={height}>{children}</div>
            {footer}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface Slice {
  name: string;
  value: number;
}

function groupSlices(rows: Slice[], max = 5): Slice[] {
  const sorted = [...rows].filter((row) => row.value > 0).sort((a, b) => b.value - a.value);
  if (sorted.length <= max) return sorted;
  const rest = sorted.slice(max - 1).reduce((sum, row) => sum + row.value, 0);
  return [...sorted.slice(0, max - 1), { name: "Otros", value: rest }];
}

function PieLegend({ rows, format }: { rows: Slice[]; format: (value: number) => string }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
  return (
    <ul className="mt-3 grid gap-y-1.5 text-sm">
      {rows.map((row, index) => (
        <li key={row.name} className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
          <span className="truncate">{row.name}</span>
          <span className="ml-auto shrink-0 tabular-nums text-muted-foreground">
            {format(row.value)} · {((row.value / total) * 100).toFixed(1)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function MoneyTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((item) => (
        <p key={item.name} className="tabular-nums">
          {item.name}: {currency(Number(item.value ?? 0))}
        </p>
      ))}
    </div>
  );
}

function NumberTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((item) => (
        <p key={item.name} className="tabular-nums">
          {item.name}: {Number(item.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

function monthlySeries(sales: DashboardSale[], orders: DashboardOrder[], period: PeriodState) {
  const map = new Map<string, { ventas: number; ganancia: number; inversion: number }>();
  const ensure = (key: string) => {
    const row = map.get(key) ?? { ventas: 0, ganancia: 0, inversion: 0 };
    map.set(key, row);
    return row;
  };

  sales.filter((sale) => inPeriod(sale.date, period)).forEach((sale) => {
    const row = ensure(monthKey(sale.date));
    row.ventas += sale.total;
    row.ganancia += sale.profit;
  });

  orders.filter((order) => inPeriod(order.date, period)).forEach((order) => {
    ensure(monthKey(order.date)).inversion += order.total;
  });

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ mes: monthLabel(key), ...value }));
}

export function DashboardClient({ sales, orders, inventory }: DashboardClientProps) {
  const [salesPeriod, setSalesPeriod] = useState<PeriodState>({ preset: "12m" });
  const [profitPeriod, setProfitPeriod] = useState<PeriodState>({ preset: "12m" });
  const [investmentPeriod, setInvestmentPeriod] = useState<PeriodState>({ preset: "12m" });
  const [topPeriod, setTopPeriod] = useState<PeriodState>({ preset: "3m" });
  const [franchisePeriod, setFranchisePeriod] = useState<PeriodState>({ preset: "all" });
  const [typePeriod, setTypePeriod] = useState<PeriodState>({ preset: "all" });

  const salesMonthly = useMemo(() => monthlySeries(sales, [], salesPeriod), [sales, salesPeriod]);
  const profitMonthly = useMemo(() => monthlySeries(sales, [], profitPeriod), [sales, profitPeriod]);
  const investmentMonthly = useMemo(
    () => monthlySeries(sales, orders, investmentPeriod),
    [sales, orders, investmentPeriod],
  );

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    sales.filter((sale) => inPeriod(sale.date, topPeriod)).forEach((sale) => {
      sale.items.forEach((item) => map.set(item.productName, (map.get(item.productName) ?? 0) + item.quantity));
    });
    return [...map.entries()]
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [sales, topPeriod]);

  const byFranchise = useMemo(() => {
    const map = new Map<string, number>();
    sales.filter((sale) => inPeriod(sale.date, franchisePeriod)).forEach((sale) => {
      sale.items.forEach((item) => map.set(item.franchiseName, (map.get(item.franchiseName) ?? 0) + item.revenue));
    });
    return groupSlices([...map.entries()].map(([name, value]) => ({ name, value })));
  }, [sales, franchisePeriod]);

  const inventorySplit = groupSlices([
    { name: "En stock", value: inventory.inStock },
    { name: "Vendido", value: inventory.sold },
    { name: "Pedido / en camino", value: inventory.ordered },
  ]);

  const byType = useMemo(() => {
    const map = new Map<string, { ventas: number; ganancia: number }>();
    sales.filter((sale) => inPeriod(sale.date, typePeriod)).forEach((sale) => {
      sale.items.forEach((item) => {
        const row = map.get(item.typeName) ?? { ventas: 0, ganancia: 0 };
        row.ventas += item.revenue;
        row.ganancia += item.profit;
        map.set(item.typeName, row);
      });
    });
    return [...map.entries()].map(([tipo, values]) => ({ tipo, ...values }));
  }, [sales, typePeriod]);

  const recentSales = [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const recentOrders = [...orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const axis = { fontSize: 12, stroke: "var(--color-muted-foreground)" };

  return (
    <>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Ventas por mes"
          description="Ingresos cobrados por mes"
          empty={salesMonthly.length === 0}
          filter={<PeriodFilter value={salesPeriod} onChange={setSalesPeriod} presets={monthlyPresets} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" {...axis} />
              <YAxis {...axis} />
              <Tooltip content={<MoneyTooltip />} />
              <Line type="monotone" dataKey="ventas" name="Ventas" stroke="var(--color-chart-1)" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Ganancias por mes"
          description="Utilidad neta mensual"
          empty={profitMonthly.length === 0}
          filter={<PeriodFilter value={profitPeriod} onChange={setProfitPeriod} presets={monthlyPresets} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" {...axis} />
              <YAxis {...axis} />
              <Tooltip content={<MoneyTooltip />} />
              <Line type="monotone" dataKey="ganancia" name="Ganancia" stroke="var(--color-chart-4)" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Inversión vs ingresos"
          description="Comparativa mensual de capital y retorno"
          empty={investmentMonthly.length === 0}
          filter={<PeriodFilter value={investmentPeriod} onChange={setInvestmentPeriod} presets={periodPresets} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={investmentMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" {...axis} />
              <YAxis {...axis} />
              <Tooltip content={<MoneyTooltip />} />
              <Bar dataKey="inversion" name="Inversión" fill="var(--color-chart-2)" radius={6} />
              <Bar dataKey="ventas" name="Ingresos" fill="var(--color-chart-3)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Productos más vendidos"
          description="Unidades vendidas por producto"
          empty={topProducts.length === 0}
          filter={<PeriodFilter value={topPeriod} onChange={setTopPeriod} presets={topPresets} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" allowDecimals={false} {...axis} />
              <YAxis type="category" dataKey="name" width={140} fontSize={11} stroke="var(--color-muted-foreground)" />
              <Tooltip content={<NumberTooltip />} />
              <Bar dataKey="qty" name="Unidades" fill="var(--color-chart-1)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Ventas por anime / franquicia"
          description="Monto vendido por franquicia"
          height="h-56"
          empty={byFranchise.length === 0}
          filter={<PeriodFilter value={franchisePeriod} onChange={setFranchisePeriod} presets={periodPresets} />}
          footer={<PieLegend rows={byFranchise} format={compactCurrency} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byFranchise} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85}>
                {byFranchise.map((_, index) => (
                  <Cell key={index} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<MoneyTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Distribución actual del inventario"
          description="Unidades según su estado actual"
          height="h-56"
          empty={inventorySplit.length === 0}
          footer={<PieLegend rows={inventorySplit} format={(value) => `${value} u.`} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={inventorySplit} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85}>
                {inventorySplit.map((_, index) => (
                  <Cell key={index} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<NumberTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-6">
        <ChartCard
          title="Rentabilidad por tipo de producto"
          description="Ventas y ganancia bruta según el costo real de cada unidad"
          empty={byType.length === 0}
          filter={<PeriodFilter value={typePeriod} onChange={setTypePeriod} presets={periodPresets} />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="tipo" {...axis} />
              <YAxis {...axis} />
              <Tooltip content={<MoneyTooltip />} />
              <Bar dataKey="ventas" name="Ventas" fill="var(--color-chart-1)" radius={6} />
              <Bar dataKey="ganancia" name="Ganancia" fill="var(--color-chart-4)" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Ventas recientes</CardTitle>
              <CardDescription>Últimas ventas registradas</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/ventas">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Ganancia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Sin ventas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                  {recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.code}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell className="text-right tabular-nums">{currency(sale.total)}</TableCell>
                      <TableCell className="text-right tabular-nums text-success">{currency(sale.profit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Pedidos recientes</CardTitle>
              <CardDescription>Últimas compras registradas a proveedores</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pedidos">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Productos</TableHead>
                    <TableHead className="text-right">Inversión</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Sin pedidos registrados.
                      </TableCell>
                    </TableRow>
                  )}
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link href={`/pedidos/${order.id}`} className="font-medium text-primary hover:underline">
                          {order.code}
                        </Link>
                      </TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell className="text-right tabular-nums">{order.units} u.</TableCell>
                      <TableCell className="text-right tabular-nums">{currency(order.total)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
