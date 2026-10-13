"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ColumnFilter,
  filterChipText,
  isFilterActive,
  matchesFilter,
  parseFiltersFromSearchParams,
  writeFiltersToSearchParams,
  type PlatformTableFilterType,
  type PlatformTableFilterValue,
} from "@/components/data-table/platform-table-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type PlatformTableColumn<T> = {
  id: string;
  header: ReactNode;
  /** Plain label used in filter chips and the filter editor title. */
  label?: string;
  cell: (row: T) => ReactNode;
  value?: (row: T) => string | number | Date | null | undefined;
  sortable?: boolean;
  /** Enables the column filter popover of the given type. */
  filter?: PlatformTableFilterType;
  /** Options for enum filters. */
  options?: { value: string; label: string }[];
  className?: string;
  align?: "left" | "right" | "center";
};

type SortState = { id: string; dir: "asc" | "desc" };

export type PlatformTableManualPagination = {
  page: number;
  pageSize: number;
  totalRows: number;
  basePath: string;
  q?: string;
};

type PlatformDataTableProps<T> = {
  data: T[];
  columns: PlatformTableColumn<T>[];
  rowKey: (row: T) => string;
  entity?: { singular: string; plural: string };
  searchPlaceholder?: string;
  searchText?: (row: T) => string;
  emptyLabel?: string;
  initialSort?: SortState;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  minWidth?: string;
  rowClassName?: (row: T) => string | undefined;
  manualPagination?: PlatformTableManualPagination;
  showFooter?: boolean;
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function readPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function PlatformDataTable<T>({
  data,
  columns,
  rowKey,
  entity = { singular: "registro", plural: "registros" },
  searchPlaceholder = "Buscar...",
  searchText,
  emptyLabel = "No se encontraron registros.",
  initialSort,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  minWidth = "980px",
  rowClassName,
  manualPagination,
  showFooter = true,
}: PlatformDataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(manualPagination?.q ?? "");
  const [sort, setSort] = useState<SortState | undefined>(initialSort);
  const [filters, setFilters] = useState<Record<string, PlatformTableFilterValue>>(() =>
    parseFiltersFromSearchParams(searchParams, columns),
  );
  const [page, setPage] = useState(() =>
    manualPagination?.page ?? readPositiveInt(searchParams.get("page"), 1),
  );
  const [pageSize, setPageSize] = useState(() =>
    manualPagination?.pageSize ?? readPositiveInt(searchParams.get("pageSize"), initialPageSize),
  );
  const [goToPage, setGoToPage] = useState("");

  // Builds a full href carrying q, page, pageSize and every active filter so a
  // refresh or shared link restores the exact view.
  const buildHref = useCallback(
    (overrides: { page?: number; pageSize?: number; q?: string; filters?: Record<string, PlatformTableFilterValue> }) => {
      const basePath = manualPagination?.basePath ?? "";
      const nextPage = overrides.page ?? page;
      const nextPageSize = overrides.pageSize ?? pageSize;
      // Manual mode navigations preserve the committed q (from the server) so
      // in-progress keystrokes are not accidentally promoted to a search.
      const nextQ = overrides.q ?? manualPagination?.q ?? search;
      const nextFilters = overrides.filters ?? filters;
      const params = new URLSearchParams();
      if (nextQ.trim()) params.set("q", nextQ.trim());
      params.set("page", String(nextPage));
      params.set("pageSize", String(nextPageSize));
      writeFiltersToSearchParams(params, nextFilters);
      const qs = params.toString();
      return basePath ? `${basePath}?${qs}` : `?${qs}`;
    },
    [filters, manualPagination?.basePath, manualPagination?.q, page, pageSize, search],
  );

  // Local mode: write q/page/pageSize/filters to the URL without a server
  // round-trip so a refresh restores the exact view. Manual mode relies on the
  // server reading the URL (parseListParams) and navigates via router.push/Link.
  const syncLocalUrl = useCallback(
    (overrides: Parameters<typeof buildHref>[0]) => {
      if (manualPagination) return;
      window.history.replaceState(null, "", buildHref(overrides));
    },
    [buildHref, manualPagination],
  );

  const columnById = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    let rows = q && searchText && !manualPagination ? data.filter((row) => normalize(searchText(row)).includes(q)) : data;

    for (const [id, filter] of Object.entries(filters)) {
      const column = columnById.get(id);
      if (!column?.value || !isFilterActive(filter)) continue;
      rows = rows.filter((row) => matchesFilter(column.value!(row), filter));
    }

    if (!sort) return rows;

    const sortColumn = columnById.get(sort.id);
    if (!sortColumn?.value) return rows;

    return [...rows].sort((a, b) => {
      const aValue = sortColumn.value!(a);
      const bValue = sortColumn.value!(b);
      const dir = sort.dir === "asc" ? 1 : -1;

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (aValue instanceof Date || bValue instanceof Date) {
        return (new Date(aValue).getTime() - new Date(bValue).getTime()) * dir;
      }
      if (typeof aValue === "number" && typeof bValue === "number") return (aValue - bValue) * dir;
      return String(aValue).localeCompare(String(bValue), "es", { numeric: true }) * dir;
    });
  }, [columnById, data, filters, manualPagination, search, searchText, sort]);

  // In manual mode the server total is authoritative until a column filter is
  // applied; then the footer reflects the filtered rows actually shown.
  const hasColumnFilters = Object.values(filters).some(isFilterActive);
  const totalRows = manualPagination && !hasColumnFilters ? manualPagination.totalRows : filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = totalRows === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalRows);
  const rows = manualPagination ? filtered : filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const goToPageNumber = Number(goToPage);
  const canGoToPage = /^\d+$/.test(goToPage) && goToPageNumber >= 1 && goToPageNumber <= totalPages;

  const changeSort = (id: string) => {
    setSort((current) => ({ id, dir: current?.id === id && current.dir === "asc" ? "desc" : "asc" }));
    if (!manualPagination) {
      setPage(1);
      syncLocalUrl({ page: 1 });
    }
  };

  const goTo = (target: number) => {
    if (manualPagination) {
      router.push(buildHref({ page: target }));
      return;
    }
    setPage(target);
    syncLocalUrl({ page: target });
  };

  const changePageSize = (value: string) => {
    const nextPageSize = Number(value);
    if (manualPagination) {
      router.push(buildHref({ page: 1, pageSize: nextPageSize }));
      return;
    }
    setPageSize(nextPageSize);
    setPage(1);
    syncLocalUrl({ page: 1, pageSize: nextPageSize });
  };

  const submitGoToPage = () => {
    if (!canGoToPage) return;
    goTo(goToPageNumber);
    setGoToPage("");
  };

  const setFilter = (id: string, filter: PlatformTableFilterValue | null) => {
    const next = { ...filters };
    if (filter && isFilterActive(filter)) next[id] = filter;
    else delete next[id];
    setFilters(next);
    if (manualPagination) {
      router.push(buildHref({ page: 1, filters: next }));
    } else {
      setPage(1);
      syncLocalUrl({ page: 1, filters: next });
    }
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearch("");
    if (manualPagination) {
      router.push(buildHref({ page: 1, q: "", filters: {} }));
    } else {
      setPage(1);
      syncLocalUrl({ page: 1, q: "", filters: {} });
    }
  };

  const activeFilterEntries = Object.entries(filters).filter(([, filter]) => isFilterActive(filter));
  const hasActiveState = activeFilterEntries.length > 0 || !!search.trim();

  const header = (column: PlatformTableColumn<T>) => {
    const active = sort?.id === column.id;
    return (
      <div className={cn("flex items-center gap-1", column.align === "right" && "justify-end", column.align === "center" && "justify-center")}>
        {column.sortable ? (
          <Button
            variant="ghost"
            size="sm"
            className={cn("-mx-2 h-8 gap-1 px-2 text-xs font-medium", active && "text-foreground")}
            onClick={() => changeSort(column.id)}
          >
            {column.header}
            {active ? <ArrowUp className="size-3.5 text-primary" /> : <ArrowUpDown className="size-3.5 opacity-40" />}
          </Button>
        ) : (
          column.header
        )}
        {column.filter && (
          <ColumnFilter
            column={{ label: column.label ?? (typeof column.header === "string" ? column.header : column.id), type: column.filter, options: column.options }}
            value={filters[column.id]}
            active={isFilterActive(filters[column.id])}
            onApply={(filter) => setFilter(column.id, filter)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {searchText && manualPagination ? (
        <form
          className="relative"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            router.push(buildHref({ q: search, page: 1 }));
          }}
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl pl-9 shadow-card"
          />
        </form>
      ) : searchText ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
              syncLocalUrl({ page: 1, q: event.target.value });
            }}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl pl-9 shadow-card"
          />
        </div>
      ) : null}

      {hasActiveState && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filtros:</span>
          {search.trim() && (
            <Badge className="gap-1 pr-1 bg-secondary text-secondary-foreground">
              Búsqueda: “{search.trim()}”
              <Button
                variant="ghost"
                size="icon"
                className="size-4 rounded-full"
                aria-label="Quitar búsqueda"
                onClick={() => {
                  setSearch("");
                  if (manualPagination) {
                    router.push(buildHref({ q: "", page: 1 }));
                  } else {
                    setPage(1);
                    syncLocalUrl({ page: 1, q: "" });
                  }
                }}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {activeFilterEntries.map(([id, filter]) => {
            const column = columnById.get(id);
            if (!column) return null;
            const label = column.label ?? (typeof column.header === "string" ? column.header : column.id);
            const optionType = column.filter;
            return (
              <Badge key={id} className="gap-1 pr-1 bg-secondary text-secondary-foreground">
                {label}:{" "}
                {filterChipText(
                  { label, type: optionType ?? "text", options: column.options },
                  filter,
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 rounded-full"
                  aria-label={`Quitar filtro ${label}`}
                  onClick={() => setFilter(id, null)}
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            );
          })}
          <Button variant="ghost" size="sm" className="h-auto px-1 text-xs text-primary" onClick={clearAllFilters}>
            Limpiar filtros
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <Table style={{ minWidth }}>
          <TableHeader className="bg-muted/40">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(column.align === "right" && "text-right", column.align === "center" && "text-center", column.className)}
                >
                  {header(column)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={rowKey(row)} className={rowClassName?.(row)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        column.align === "right" && "text-right tabular-nums",
                        column.align === "center" && "text-center",
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showFooter && (
        <PlatformTableFooter
          entity={entity}
          from={from}
          to={to}
          totalRows={totalRows}
          page={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          manualHref={manualPagination ? (target) => buildHref({ page: target }) : undefined}
          onGoTo={goTo}
          onChangePageSize={changePageSize}
          goToPage={goToPage}
          onGoToPageChange={setGoToPage}
          onSubmitGoToPage={submitGoToPage}
          canGoToPage={canGoToPage}
        />
      )}
    </div>
  );
}

type FooterProps = {
  entity: { singular: string; plural: string };
  from: number;
  to: number;
  totalRows: number;
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  manualHref?: (page: number) => string;
  onGoTo: (page: number) => void;
  onChangePageSize: (value: string) => void;
  goToPage: string;
  onGoToPageChange: (value: string) => void;
  onSubmitGoToPage: () => void;
  canGoToPage: boolean;
};

function PlatformTableFooter({
  entity,
  from,
  to,
  totalRows,
  page,
  totalPages,
  pageSize,
  pageSizeOptions,
  manualHref,
  onGoTo,
  onChangePageSize,
  goToPage,
  onGoToPageChange,
  onSubmitGoToPage,
  canGoToPage,
}: FooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="text-sm text-muted-foreground">
        <p>
          Mostrando {from.toLocaleString("es-PE")}-{to.toLocaleString("es-PE")} de {totalRows.toLocaleString("es-PE")}{" "}
          {totalRows === 1 ? entity.singular : entity.plural}
        </p>
        <p className="text-xs">Página {page} de {totalPages}</p>
      </div>

      <nav aria-label="Paginación" className="flex items-center gap-1">
        <PaginationButton
          disabled={page <= 1}
          href={manualHref ? manualHref(page - 1) : undefined}
          onClick={() => onGoTo(page - 1)}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Anterior</span>
        </PaginationButton>
        <Button size="sm" className="h-8 min-w-8 px-2 tabular-nums" aria-current="page">
          {page}
        </Button>
        <PaginationButton
          disabled={page >= totalPages}
          href={manualHref ? manualHref(page + 1) : undefined}
          onClick={() => onGoTo(page + 1)}
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="size-4" />
        </PaginationButton>
      </nav>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="whitespace-nowrap text-xs text-muted-foreground">Filas por página</Label>
          <Select value={String(pageSize)} onValueChange={onChangePageSize}>
            <SelectTrigger className="h-8 w-20 min-w-20 rounded-xl shadow-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="whitespace-nowrap text-xs text-muted-foreground">Ir a página</Label>
          <Input
            inputMode="numeric"
            value={goToPage}
            onChange={(event) => onGoToPageChange(event.target.value.replace(/\D/g, ""))}
            onKeyDown={(event) => event.key === "Enter" && onSubmitGoToPage()}
            placeholder={`1-${totalPages}`}
            className="h-8 w-20 rounded-xl shadow-card"
          />
          <Button variant="outline" size="sm" className="h-8" disabled={!canGoToPage} onClick={onSubmitGoToPage}>
            Ir
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaginationButton({ disabled, href, onClick, children }: { disabled: boolean; href?: string; onClick: () => void; children: ReactNode }) {
  if (href && !disabled) {
    return (
      <Button variant="outline" size="sm" className="h-8" asChild>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" className="h-8" disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}
