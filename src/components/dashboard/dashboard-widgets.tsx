"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { presetLabels, type PeriodState, type Preset, type Slice } from "@/lib/dashboard/metrics";
import { currency } from "@/lib/money/format";

export const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export const axis = { fontSize: 12, stroke: "var(--color-muted-foreground)" };

export function PeriodFilter({
  value,
  onChange,
  presets,
}: {
  value: PeriodState;
  onChange: (value: PeriodState) => void;
  presets: Preset[];
}) {
  return (
    <Select value={value.preset} onValueChange={(preset) => onChange({ preset: preset as Preset })}>
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

export function ChartCard({
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

export function PieLegend({ rows, format }: { rows: Slice[]; format: (value: number) => string }) {
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

export function MoneyTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number }[]; label?: string }) {
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

export function NumberTooltip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number }[]; label?: string }) {
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
