import Link from "next/link";
import { Plus } from "lucide-react";

import { EmptyTable } from "@/components/data-table/empty-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ModulePage({
  title,
  description,
  tableTitle,
  tableDescription,
  columns,
  createHref,
  createLabel,
  emptyLabel,
}: {
  title: string;
  description: string;
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  createHref?: string;
  createLabel?: string;
  emptyLabel?: string;
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          createHref && createLabel ? (
            <Button asChild>
              <Link href={createHref}>
                <Plus className="h-4 w-4" />
                {createLabel}
              </Link>
            </Button>
          ) : null
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>{tableTitle}</CardTitle>
          <CardDescription>{tableDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground md:grid-cols-3">
            <span>Búsqueda server-side</span>
            <span>Filtros por columna</span>
            <span>Paginación 10 / 20 / 50 / 100</span>
          </div>
          <EmptyTable columns={columns} emptyLabel={emptyLabel} />
        </CardContent>
      </Card>
    </>
  );
}
