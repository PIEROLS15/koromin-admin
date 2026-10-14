"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { isoToLocalDate, localDateToIso } from "@/components/data-table/platform-table-filter";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FinanceOptions } from "@/server/finance/summary";

const ALL = "todos";

type OptionItem = { value: string; label: string };

function periodLabel(fromIso: string, toIso: string) {
  if (fromIso && toIso) return `${fromIso} – ${toIso}`;
  if (fromIso) return `Desde ${fromIso}`;
  if (toIso) return `Hasta ${toIso}`;
  return "Todo el periodo";
}

function toOptions(rows: Array<{ id: string; name: string }>): OptionItem[] {
  return rows.map((row) => ({ value: row.id, label: row.name }));
}

export function FinanceFilters({ options }: { options: FinanceOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [periodOpen, setPeriodOpen] = useState(false);
  const [fromIso, setFromIso] = useState(searchParams.get("from") ?? "");
  const [toIso, setToIso] = useState(searchParams.get("to") ?? "");

  const franchise = searchParams.get("franchise") ?? ALL;
  const type = searchParams.get("type") ?? ALL;
  const order = searchParams.get("order") ?? ALL;
  const investor = searchParams.get("investor") ?? ALL;

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === ALL) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const renderSelect = (label: string, value: string, onChange: (value: string) => void, allLabel: string, items: OptionItem[]) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base">Filtros</CardTitle>
        <CardDescription>Combina periodo, categoría, pedido e inversionista.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-2">
          <Label>Periodo</Label>
          <Popover
            open={periodOpen}
            onOpenChange={(open) => {
              setPeriodOpen(open);
              if (!open) pushParams({ from: fromIso, to: toIso });
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start font-normal", !fromIso && !toIso && "text-muted-foreground")}
              >
                {periodLabel(fromIso, toIso)}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-3">
              <Calendar
                mode="range"
                defaultMonth={isoToLocalDate(fromIso)}
                selected={{ from: isoToLocalDate(fromIso), to: isoToLocalDate(toIso) }}
                onSelect={(range) => {
                  setFromIso(range?.from ? localDateToIso(range.from) : "");
                  setToIso(range?.to ? localDateToIso(range.to) : "");
                }}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>

        {renderSelect("Anime", franchise, (value) => pushParams({ franchise: value }), "Todos", toOptions(options.franchises))}
        {renderSelect("Tipo de producto", type, (value) => pushParams({ type: value }), "Todos", toOptions(options.productTypes))}
        {renderSelect(
          "Pedido",
          order,
          (value) => pushParams({ order: value }),
          "Todos",
          options.orders.map((o) => ({ value: o.id, label: o.code })),
        )}
        {renderSelect("Inversionista", investor, (value) => pushParams({ investor: value }), "Todos", toOptions(options.investors))}
      </CardContent>
    </Card>
  );
}
