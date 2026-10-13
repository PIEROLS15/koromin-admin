import { FranchisesManager } from "@/components/catalogs/franchises-table";
import { requirePermission } from "@/lib/auth/guards";
import { getFranchisesWithStats } from "@/server/catalogs/queries";

export default async function AnimesPage() {
  await requirePermission("products.manage");
  const rows = await getFranchisesWithStats();

  return <FranchisesManager rows={rows} />;
}
