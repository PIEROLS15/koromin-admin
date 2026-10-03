import { requirePermission } from "@/lib/auth/guards";
import { ProductsTable } from "@/components/catalogs/products-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductList } from "@/server/catalogs/queries";

export default async function ProductsPage() {
  await requirePermission("products.manage");
  const products = await getProductList();

  return (
    <>
      <PageHeader title="Productos" description="Catálogo maestro. El costo y stock viven en pedidos e inventario." />
      <Card>
        <CardHeader><CardTitle>Catálogo</CardTitle><CardDescription>Mostrando hasta 100 productos.</CardDescription></CardHeader>
        <CardContent><ProductsTable products={products} /></CardContent>
      </Card>
    </>
  );
}
