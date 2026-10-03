import type { DashboardInventory, DashboardOrder, DashboardSale } from "@/lib/dashboard/types";

export type Preset = "30d" | "3m" | "6m" | "12m" | "year" | "all";

export interface PeriodState {
  preset: Preset;
}

export interface Slice {
  name: string;
  value: number;
}

export const presetLabels: Record<Preset, string> = {
  "30d": "Últimos 30 días",
  "3m": "Últimos 3 meses",
  "6m": "Últimos 6 meses",
  "12m": "Últimos 12 meses",
  year: "Año actual",
  all: "Todo el historial",
};

export const monthlyPresets: Preset[] = ["3m", "6m", "12m", "year", "all"];
export const periodPresets: Preset[] = ["3m", "6m", "12m", "year", "all"];
export const topPresets: Preset[] = ["30d", "3m", "6m", "year", "all"];

export function inPeriod(date: string, period: PeriodState, now = new Date()) {
  if (period.preset === "all") return true;
  const value = new Date(`${date}T00:00:00`);
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

export function compactCurrency(value: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

export function groupSlices(rows: Slice[], max = 5): Slice[] {
  const sorted = [...rows].filter((row) => row.value > 0).sort((a, b) => b.value - a.value);
  if (sorted.length <= max) return sorted;
  const rest = sorted.slice(max - 1).reduce((sum, row) => sum + row.value, 0);
  return [...sorted.slice(0, max - 1), { name: "Otros", value: rest }];
}

export function monthlySeries(sales: DashboardSale[], orders: DashboardOrder[], period: PeriodState) {
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

export function topProducts(sales: DashboardSale[], period: PeriodState) {
  const map = new Map<string, number>();
  sales.filter((sale) => inPeriod(sale.date, period)).forEach((sale) => {
    sale.items.forEach((item) => map.set(item.productName, (map.get(item.productName) ?? 0) + item.quantity));
  });
  return [...map.entries()]
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);
}

export function salesByFranchise(sales: DashboardSale[], period: PeriodState) {
  const map = new Map<string, number>();
  sales.filter((sale) => inPeriod(sale.date, period)).forEach((sale) => {
    sale.items.forEach((item) => map.set(item.franchiseName, (map.get(item.franchiseName) ?? 0) + item.revenue));
  });
  return groupSlices([...map.entries()].map(([name, value]) => ({ name, value })));
}

export function inventorySplit(inventory: DashboardInventory) {
  return groupSlices([
    { name: "En stock", value: inventory.inStock },
    { name: "Vendido", value: inventory.sold },
    { name: "Pedido / en camino", value: inventory.ordered },
  ]);
}

export function profitabilityByType(sales: DashboardSale[], period: PeriodState) {
  const map = new Map<string, { ventas: number; ganancia: number }>();
  sales.filter((sale) => inPeriod(sale.date, period)).forEach((sale) => {
    sale.items.forEach((item) => {
      const row = map.get(item.typeName) ?? { ventas: 0, ganancia: 0 };
      row.ventas += item.revenue;
      row.ganancia += item.profit;
      map.set(item.typeName, row);
    });
  });
  return [...map.entries()].map(([tipo, values]) => ({ tipo, ...values }));
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
