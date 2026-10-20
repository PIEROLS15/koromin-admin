import { ProductTypesManager } from "@/components/catalogs/product-types-table";
import { requirePermission } from "@/lib/auth/guards";
import { getProductTypeList } from "@/server/catalogs/queries";

export default async function ProductTypesPage() {
  await requirePermission("products.manage");
  const rows = await getProductTypeList();

  return <ProductTypesManager rows={rows} />;
}
