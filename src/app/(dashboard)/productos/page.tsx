import { requirePermission } from "@/lib/auth/guards";
import { ProductsTable } from "@/components/catalogs/products-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductList } from "@/server/catalogs/queries";
import { parseListParams } from "@/server/shared/pagination";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("products.manage");
  const params = parseListParams(await searchParams);
  const products = await getProductList(params);

  return (
    <>
      <PageHeader title="Productos" description="Catálogo maestro. El costo y stock viven en pedidos e inventario." />
      <Card>
        <CardHeader><CardTitle>Catálogo</CardTitle><CardDescription>Filtra y navega productos por nombre.</CardDescription></CardHeader>
        <CardContent>
          <ProductsTable products={products.rows} pagination={{ page: products.page, pageSize: products.pageSize, totalRows: products.total, basePath: "/productos", q: params.q }} />
        </CardContent>
      </Card>
    </>
  );
}
