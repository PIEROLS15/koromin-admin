import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PaginatedResult } from "@/server/shared/pagination";

export function PaginationControls<T>({ result, basePath, q }: { result: PaginatedResult<T>; basePath: string; q?: string }) {
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Mostrando {from}-{to} de {result.total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={result.page <= 1} asChild={result.page > 1}>
          {result.page > 1 ? <Link href={pageHref(basePath, result.page - 1, result.pageSize, q)}>Anterior</Link> : <span>Anterior</span>}
        </Button>
        <span className="px-2 tabular-nums">
          {result.page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={result.page >= totalPages} asChild={result.page < totalPages}>
          {result.page < totalPages ? <Link href={pageHref(basePath, result.page + 1, result.pageSize, q)}>Siguiente</Link> : <span>Siguiente</span>}
        </Button>
      </div>
    </div>
  );
}

function pageHref(basePath: string, page: number, pageSize: number, q?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (q) params.set("q", q);
  return `${basePath}?${params.toString()}`;
}
