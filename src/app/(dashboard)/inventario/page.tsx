import { requirePermission } from "@/lib/auth/guards";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryUnitList } from "@/server/inventory/queries";

export default async function InventoryPage() {
  await requirePermission("inventory.manage");
  const units = await getInventoryUnitList();

  return (
    <>
      <PageHeader title="Inventario" description="Unidades físicas con costo real, estado y origen de compra." />
      <Card>
        <CardHeader><CardTitle>Unidades</CardTitle><CardDescription>Mostrando hasta 100 unidades recientes.</CardDescription></CardHeader>
        <CardContent><InventoryTable units={units} /></CardContent>
      </Card>
    </>
  );
}
