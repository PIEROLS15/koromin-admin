import { requirePermission } from "@/lib/auth/guards";
import { AnimeCatalogTable } from "@/components/catalogs/anime-catalog-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnimeCatalogRows } from "@/server/catalogs/queries";

export default async function AnimesPage() {
  await requirePermission("products.manage");
  const rows = await getAnimeCatalogRows();

  return (
    <>
      <PageHeader title="Animes / Categorías" description="Franquicias, categorías y tipos de producto configurables." />
      <Card>
        <CardHeader><CardTitle>Catálogos</CardTitle><CardDescription>Franquicias, categorías y tipos usados por productos.</CardDescription></CardHeader>
        <CardContent><AnimeCatalogTable rows={rows} /></CardContent>
      </Card>
    </>
  );
}
