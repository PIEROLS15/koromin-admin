import { requirePermission } from "@/lib/auth/guards";
import { ProductsManager } from "@/components/catalogs/products-table";
import { getProductList, getProductOptions } from "@/server/catalogs/queries";
import { parseListParams } from "@/server/shared/pagination";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePermission("products.manage");
  const params = parseListParams(await searchParams);
  const [products, options] = await Promise.all([getProductList(params), getProductOptions()]);

  return (
    <ProductsManager
      products={products.rows}
      options={options}
      pagination={{
        page: products.page,
        pageSize: products.pageSize,
        totalRows: products.total,
        basePath: "/productos",
        q: params.q,
      }}
    />
  );
}
