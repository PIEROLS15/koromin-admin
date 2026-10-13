"use client";

import { useState } from "react";
import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type PlatformTableFilterType = "text" | "enum" | "date" | "number";

export type PlatformTableNumberOp = "eq" | "gt" | "lt" | "between";

export type PlatformTableFilterValue =
  | { type: "text"; q: string }
  | { type: "enum"; values: string[] }
  | { type: "date"; from: string; to: string }
  | { type: "number"; op: PlatformTableNumberOp; a?: number; b?: number };

export type PlatformTableFilterColumn = {
  /** Plain label used in chips and the editor title. */
  label: string;
  type: PlatformTableFilterType;
  /** Options for enum filters. */
  options?: { value: string; label: string }[];
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function isFilterActive(filter?: PlatformTableFilterValue) {
  if (!filter) return false;
  if (filter.type === "text") return !!filter.q.trim();
  if (filter.type === "enum") return filter.values.length > 0;
  if (filter.type === "date") return !!filter.from || !!filter.to;
  return filter.a != null || filter.b != null;
}

export function matchesFilter(value: string | number | Date | null | undefined, filter: PlatformTableFilterValue) {
  switch (filter.type) {
    case "text":
      return normalize(value).includes(normalize(filter.q));
    case "enum":
      return filter.values.includes(String(value ?? ""));
    case "date": {
      const day = String(value ?? "").slice(0, 10);
      if (!day) return false;
      return (!filter.from || day >= filter.from) && (!filter.to || day <= filter.to);
    }
    case "number": {
      const n = Number(value ?? 0);
      if (filter.op === "eq") return filter.a == null || n === filter.a;
      if (filter.op === "gt") return filter.a == null || n > filter.a;
      if (filter.op === "lt") return filter.a == null || n < filter.a;
      return (filter.a == null || n >= filter.a) && (filter.b == null || n <= filter.b);
    }
  }
}

export function filterChipText(column: PlatformTableFilterColumn, filter: PlatformTableFilterValue) {
  switch (filter.type) {
    case "text":
      return `“${filter.q}”`;
    case "enum":
      return filter.values.map((v) => column.options?.find((o) => o.value === v)?.label ?? v).join(", ");
    case "date":
      if (filter.from && filter.to) return `${filter.from} – ${filter.to}`;
      return filter.from ? `desde ${filter.from}` : `hasta ${filter.to}`;
    case "number":
      if (filter.op === "eq") return `= ${filter.a ?? 0}`;
      if (filter.op === "gt") return `> ${filter.a ?? 0}`;
      if (filter.op === "lt") return `< ${filter.a ?? 0}`;
      if (filter.a != null && filter.b != null) return `${filter.a} – ${filter.b}`;
      return filter.a != null ? `≥ ${filter.a}` : `≤ ${filter.b ?? 0}`;
  }
}

/** ISO "YYYY-MM-DD" -> local Date (avoids UTC day-shift from `new Date(iso)`). */
export function isoToLocalDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** Local Date -> ISO "YYYY-MM-DD" (uses local parts, not UTC). */
export function localDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Serializes a filter into a URL-friendly string (no type prefix — the type
 * comes from the column definition). Multi-part values use URL-safe delimiters
 * (`*`, `..`) that `URLSearchParams` leaves unencoded.
 *
 * - text   → `q`
 * - enum   → `v1*v2`
 * - date   → `from..to`
 * - number → `a` (eq) / `gta` (gt) / `lta` (lt) / `a..b` (between)
 */
export function encodeFilterValue(filter: PlatformTableFilterValue): string {
  switch (filter.type) {
    case "text":
      return filter.q;
    case "enum":
      return filter.values.join("*");
    case "date":
      return `${filter.from}..${filter.to}`;
    case "number":
      if (filter.op === "eq") return String(filter.a ?? "");
      if (filter.op === "gt") return `gt${filter.a ?? ""}`;
      if (filter.op === "lt") return `lt${filter.a ?? ""}`;
      return `${filter.a ?? ""}..${filter.b ?? ""}`;
  }
}

/** Parses a filter value produced by {@link encodeFilterValue}, given the column's filter type. */
export function decodeFilterValue(raw: string, type: PlatformTableFilterType): PlatformTableFilterValue | null {
  if (type === "text") return { type: "text", q: raw };
  if (type === "enum") {
    const values = raw.split("*").filter(Boolean);
    return values.length ? { type: "enum", values } : null;
  }
  if (type === "date") {
    const [from = "", to = ""] = raw.split("..");
    return { type: "date", from, to };
  }
  if (raw.startsWith("gt")) {
    const a = Number(raw.slice(2));
    return Number.isFinite(a) ? { type: "number", op: "gt", a } : null;
  }
  if (raw.startsWith("lt")) {
    const a = Number(raw.slice(2));
    return Number.isFinite(a) ? { type: "number", op: "lt", a } : null;
  }
  if (raw.includes("..")) {
    const [a = "", b = ""] = raw.split("..");
    return { type: "number", op: "between", a: a === "" ? undefined : Number(a), b: b === "" ? undefined : Number(b) };
  }
  const a = Number(raw);
  return Number.isFinite(a) ? { type: "number", op: "eq", a } : null;
}

/** Minimal column shape needed to resolve a filter param's type. */
type FilterColumnRef = { id: string; filter?: PlatformTableFilterType };

/**
 * Reads every `f_<columnId>` filter param from a URLSearchParams instance.
 * The filter type is resolved from the column definition (not the URL), so
 * params whose column has no declared filter are ignored.
 */
export function parseFiltersFromSearchParams(
  params: URLSearchParams,
  columns: FilterColumnRef[],
): Record<string, PlatformTableFilterValue> {
  const typeById = new Map(
    columns.filter((column) => column.filter).map((column) => [column.id, column.filter as PlatformTableFilterType]),
  );
  const out: Record<string, PlatformTableFilterValue> = {};
  params.forEach((value, key) => {
    if (!key.startsWith("f_")) return;
    const id = key.slice(2);
    const type = typeById.get(id);
    if (!type) return;
    const decoded = decodeFilterValue(value, type);
    if (decoded && isFilterActive(decoded)) out[id] = decoded;
  });
  return out;
}

/** Appends every active filter to a URLSearchParams instance (in place). */
export function writeFiltersToSearchParams(
  params: URLSearchParams,
  filters: Record<string, PlatformTableFilterValue>,
) {
  for (const [id, filter] of Object.entries(filters)) {
    if (isFilterActive(filter)) params.set(`f_${id}`, encodeFilterValue(filter));
  }
}

type ColumnFilterProps = {
  column: PlatformTableFilterColumn;
  value: PlatformTableFilterValue | undefined;
  active: boolean;
  onApply: (filter: PlatformTableFilterValue | null) => void;
};

type FilterEditorProps = {
  column: PlatformTableFilterColumn;
  value: PlatformTableFilterValue | undefined;
  onApply: (filter: PlatformTableFilterValue | null) => void;
};

export function ColumnFilter({ column, value, active, onApply }: ColumnFilterProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={active ? "secondary" : "ghost"}
          size="icon"
          className={cn("relative size-6", active && "text-primary")}
          aria-label={`Filtrar ${column.label}`}
        >
          <Filter className={cn("size-3.5", active ? "fill-primary/30" : "opacity-50")} />
          {active && <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        {open && (
          <FilterEditor
            column={column}
            value={value}
            onApply={(filter) => {
              onApply(filter);
              setOpen(false);
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function FilterEditor({ column, value, onApply }: FilterEditorProps) {
  const [text, setText] = useState(value?.type === "text" ? value.q : "");
  const [values, setValues] = useState<string[]>(value?.type === "enum" ? value.values : []);
  const [from, setFrom] = useState(value?.type === "date" ? value.from : "");
  const [to, setTo] = useState(value?.type === "date" ? value.to : "");
  const [op, setOp] = useState<PlatformTableNumberOp>(value?.type === "number" ? value.op : "between");
  const [a, setA] = useState(value?.type === "number" && value.a != null ? String(value.a) : "");
  const [b, setB] = useState(value?.type === "number" && value.b != null ? String(value.b) : "");

  const apply = () => {
    if (column.type === "text") return onApply({ type: "text", q: text });
    if (column.type === "enum") return onApply({ type: "enum", values });
    if (column.type === "date") return onApply({ type: "date", from, to });
    const na = a === "" ? undefined : Number(a);
    const nb = b === "" || op !== "between" ? undefined : Number(b);
    return onApply({ type: "number", op, a: na, b: nb });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Filtrar por {column.label}</p>

      {column.type === "text" && (
        <Input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="Contiene..."
        />
      )}

      {column.type === "enum" && (
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {column.options?.map((option) => {
            const checked = values.includes(option.value);
            return (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1.5 text-sm hover:bg-accent">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() =>
                    setValues(checked ? values.filter((v) => v !== option.value) : [...values, option.value])
                  }
                />
                <span className="truncate">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {column.type === "date" && (
        <div className="space-y-2">
          <Calendar
            mode="range"
            defaultMonth={isoToLocalDate(from)}
            selected={{ from: isoToLocalDate(from), to: isoToLocalDate(to) }}
            onSelect={(range) => {
              setFrom(range?.from ? localDateToIso(range.from) : "");
              setTo(range?.to ? localDateToIso(range.to) : "");
            }}
            numberOfMonths={1}
          />
          <p className="text-xs text-muted-foreground">
            {from || to ? `${from || "…"} – ${to || "…"}` : "Selecciona un rango de fechas"}
          </p>
        </div>
      )}

      {column.type === "number" && (
        <div className="space-y-2">
          <Select value={op} onValueChange={(v) => setOp(v as PlatformTableNumberOp)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="between">Entre</SelectItem>
              <SelectItem value="eq">Igual a</SelectItem>
              <SelectItem value="gt">Mayor que</SelectItem>
              <SelectItem value="lt">Menor que</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={a}
              onChange={(e) => setA(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apply()}
              placeholder={op === "between" ? "Desde" : "Valor"}
            />
            {op === "between" && (
              <Input
                type="number"
                value={b}
                onChange={(e) => setB(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && apply()}
                placeholder="Hasta"
              />
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => onApply(null)}>
          Quitar
        </Button>
        <Button size="sm" onClick={apply}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}
